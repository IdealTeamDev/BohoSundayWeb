import { getOrder, approveOrder, rejectOrder, OrderDetail } from './orderStore';
import { markAsSold, releaseLock } from './lockStore';
import { addEmailToQueue } from './emailQueue';
import { getDynamicTickets } from './tickets';
import { supabase } from './supabase';

let lastSyncSweepAt = 0;
const SYNC_SWEEP_THROTTLE_MS = 60 * 1000; // 1 minute

export interface ReconcileOrderResult {
  orderId: string;
  previousStatus: string;
  newStatus: 'pending' | 'approved' | 'rejected';
  synced: boolean;
  paymentId?: string;
  message: string;
  wompiStatus?: string;
}

/**
 * Finalizes an order as approved:
 * 1. Updates `orders` table to 'approved' and inserts into `purchased_tickets` (for staff QR scanner).
 * 2. Marks table/bed as sold in `ticket_locks` and `boleteria_mesas`.
 * 3. Sends confirmation email with QR PNG attachment to the buyer.
 */
export async function finalizeApprovedOrder(
  order: OrderDetail,
  paymentId: string
): Promise<OrderDetail | null> {
  // Check if already in purchased_tickets to avoid duplicate rows/emails
  const { data: existingPurchase } = await supabase
    .from('purchased_tickets')
    .select('order_id')
    .eq('order_id', order.orderId)
    .maybeSingle();

  const updatedOrder = await approveOrder(order.orderId, paymentId, order);
  const tickets = await getDynamicTickets(order.stageId, true, true);

  await markAsSold(order.ticketId, order.sessionToken, tickets).catch((err) => {
    console.error(`[WompiReconcile] Error in markAsSold for ${order.orderId}:`, err);
  });

  if (!existingPurchase) {
    await addEmailToQueue({
      ticketId: order.ticketId,
      orderId: order.orderId,
      buyerInfo: order.buyerInfo,
      quantity: order.quantity,
    }).catch((err) => {
      console.error(`[WompiReconcile] Error sending confirmation email for ${order.orderId}:`, err);
    });
  }

  return updatedOrder;
}

/**
 * Determines Wompi base URLs and authentication keys from environment variables.
 */
function getWompiConfig() {
  const privateKey = (
    process.env.WOMPI_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_WOMPI_PRIVATE_KEY ||
    ''
  ).trim();
  const publicKey = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '').trim();

  const isProdKey =
    privateKey.startsWith('prv_prod_') ||
    (!privateKey && publicKey.startsWith('pub_prod_'));

  const primaryBaseUrl = isProdKey
    ? 'https://production.wompi.co'
    : 'https://sandbox.wompi.co';
  const secondaryBaseUrl = isProdKey
    ? 'https://sandbox.wompi.co'
    : 'https://production.wompi.co';

  return {
    privateKey,
    publicKey,
    hasPrivateKey: Boolean(privateKey && !privateKey.endsWith('_')),
    primaryBaseUrl,
    secondaryBaseUrl,
  };
}

/**
 * Queries Wompi API directly (by transaction ID if available, and by reference = orderId using WOMPI_PRIVATE_KEY)
 * and synchronizes the order status in Supabase.
 */
export async function verifyOrderWithWompi(
  orderId: string,
  options?: {
    wompiTxId?: string;
    autoRejectOnDecline?: boolean;
  }
): Promise<ReconcileOrderResult> {
  const order = await getOrder(orderId);
  if (!order) {
    return {
      orderId,
      previousStatus: 'unknown',
      newStatus: 'pending',
      synced: false,
      message: `Orden ${orderId} no encontrada en la base de datos.`,
    };
  }

  if (order.status === 'approved') {
    return {
      orderId,
      previousStatus: 'approved',
      newStatus: 'approved',
      synced: false,
      paymentId: order.paymentId,
      message: `La orden ${orderId} ya se encuentra aprobada.`,
    };
  }

  const { privateKey, publicKey, hasPrivateKey, primaryBaseUrl, secondaryBaseUrl } =
    getWompiConfig();
  const txIdToLookup = options?.wompiTxId?.trim() || order.paymentId?.trim();

  let matchedTransactions: any[] = [];

  // 1. If we have a specific Wompi transaction ID, query /v1/transactions/{id}
  if (txIdToLookup) {
    for (const baseUrl of [primaryBaseUrl, secondaryBaseUrl]) {
      try {
        const res = await fetch(`${baseUrl}/v1/transactions/${encodeURIComponent(txIdToLookup)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && (!json.data.reference || json.data.reference === orderId)) {
            matchedTransactions.push(json.data);
            break;
          }
        }
      } catch (err) {
        console.warn(`[WompiReconcile] Error fetching transaction ${txIdToLookup} from ${baseUrl}:`, err);
      }
    }
  }

  // 2. Query by reference (?reference={orderId}) using WOMPI_PRIVATE_KEY (or publicKey fallback)
  if (matchedTransactions.length === 0) {
    const bearerKey = hasPrivateKey ? privateKey : publicKey;
    if (bearerKey && bearerKey !== 'pub_test_') {
      for (const baseUrl of [primaryBaseUrl, secondaryBaseUrl]) {
        try {
          const url = `${baseUrl}/v1/transactions?reference=${encodeURIComponent(orderId)}`;
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${bearerKey}`,
            },
            cache: 'no-store',
          });

          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json?.data) ? json.data : [];
            const forOrder = list.filter((tx: any) => tx && tx.reference === orderId);
            if (forOrder.length > 0) {
              matchedTransactions = forOrder;
              break;
            }
          }
        } catch (err) {
          console.warn(`[WompiReconcile] Error querying reference ${orderId} on ${baseUrl}:`, err);
        }
      }
    }
  }

  // 3. If order is Mercado Pago and no Wompi transactions found, also check Mercado Pago API by external_reference
  if (matchedTransactions.length === 0 && order.paymentMethod === 'mercadopago') {
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (mpToken) {
      try {
        const mpRes = await fetch(
          `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}`,
          {
            headers: { Authorization: `Bearer ${mpToken}` },
            cache: 'no-store',
          }
        );
        if (mpRes.ok) {
          const mpJson = await mpRes.json();
          const results = Array.isArray(mpJson?.results) ? mpJson.results : [];
          const approvedMp = results.find((r: any) => r.status === 'approved');
          if (approvedMp) {
            const paymentId = String(approvedMp.id);
            await finalizeApprovedOrder(order, paymentId);
            return {
              orderId,
              previousStatus: order.status,
              newStatus: 'approved',
              synced: true,
              paymentId,
              wompiStatus: 'APPROVED (MercadoPago)',
              message: `Pago aprobado en Mercado Pago (ID: ${paymentId}). Orden aprobada y QR enviado al cliente.`,
            };
          }
        }
      } catch (err) {
        console.warn(`[WompiReconcile] Error checking MercadoPago for ${orderId}:`, err);
      }
    }
  }

  if (matchedTransactions.length === 0) {
    const missingKeyHint = !hasPrivateKey
      ? ' (Nota: Configura WOMPI_PRIVATE_KEY en las variables de entorno para consultar por referencia sin ID de transacción, o ingresa el ID de transacción de Wompi).'
      : '';
    return {
      orderId,
      previousStatus: order.status,
      newStatus: order.status,
      synced: false,
      message: `No se encontraron transacciones registradas en Wompi para la referencia ${orderId}.${missingKeyHint}`,
    };
  }

  // Prioritize any APPROVED transaction if the user had multiple attempts
  const approvedTx = matchedTransactions.find((tx: any) => tx.status === 'APPROVED');
  if (approvedTx) {
    const paymentId = String(approvedTx.id);
    console.log(
      `[WompiReconcile] ✅ Found APPROVED Wompi transaction ${paymentId} for pending order ${orderId}. Auto-approving!`
    );

    await finalizeApprovedOrder(order, paymentId);

    return {
      orderId,
      previousStatus: order.status,
      newStatus: 'approved',
      synced: true,
      paymentId,
      wompiStatus: 'APPROVED',
      message: `Transacción ${paymentId} APROBADA en Wompi. Se registró la boleta en purchased_tickets y se envió el QR al correo ${order.buyerInfo.email}.`,
    };
  }

  // Otherwise inspect the most recent transaction
  const latestTx = matchedTransactions[0];
  const latestStatus = String(latestTx.status || '').toUpperCase();
  const latestId = String(latestTx.id || '');

  if (
    options?.autoRejectOnDecline &&
    ['DECLINED', 'VOIDED', 'ERROR'].includes(latestStatus)
  ) {
    // Only auto-reject if the order is at least 10 minutes old so we don't kill an active retry session
    const ageMs = Date.now() - order.createdAt;
    if (ageMs >= 10 * 60 * 1000) {
      const tickets = await getDynamicTickets(order.stageId, true, true);
      await rejectOrder(
        orderId,
        `Reconciliación Wompi: Transacción ${latestId} en estado ${latestStatus}`
      );
      await releaseLock(order.ticketId, order.sessionToken, tickets).catch(() => {});

      return {
        orderId,
        previousStatus: order.status,
        newStatus: 'rejected',
        synced: true,
        paymentId: latestId,
        wompiStatus: latestStatus,
        message: `La transacción ${latestId} en Wompi figura como ${latestStatus}. La orden fue marcada como rechazada.`,
      };
    }
  }

  return {
    orderId,
    previousStatus: order.status,
    newStatus: order.status,
    synced: false,
    paymentId: latestId,
    wompiStatus: latestStatus,
    message: `Transacción ${latestId} encontrada en Wompi con estado: ${latestStatus}.`,
  };
}

/**
 * Forces immediate approval of a pending/rejected order from the Admin Panel (Taquilla / Soporte),
 * inserting into `purchased_tickets`, locking the table/stock, and emailing the QR code to the buyer.
 */
export async function forceApproveOrder(
  orderId: string,
  manualPaymentRef?: string
): Promise<ReconcileOrderResult> {
  const order = await getOrder(orderId);
  if (!order) {
    return {
      orderId,
      previousStatus: 'unknown',
      newStatus: 'pending',
      synced: false,
      message: `Orden ${orderId} no encontrada.`,
    };
  }

  // Prevent overselling a table/cama if another order already bought it in this edition
  const tickets = await getDynamicTickets(order.stageId, true, true);
  const ticket = tickets.find(
    (t) => t.id === order.ticketId || t.id.toLowerCase() === order.ticketId.toLowerCase()
  );

  if (!ticket || ticket.stock === undefined) {
    const editionSlug = order.editionSlug || 'white-edition-iii';
    const { data: existingTableSales } = await supabase
      .from('purchased_tickets')
      .select('order_id, buyer_name')
      .eq('ticket_id', order.ticketId)
      .eq('status', 'paid')
      .eq('edition_slug', editionSlug)
      .neq('order_id', order.orderId)
      .limit(1);

    if (existingTableSales && existingTableSales.length > 0) {
      const winner = existingTableSales[0];
      return {
        orderId,
        previousStatus: order.status,
        newStatus: order.status,
        synced: false,
        message: `⚠️ No se puede aprobar esta orden porque la mesa/cama (${order.ticketId}) YA fue comprada y pagada por ${winner.buyer_name} en la orden ${winner.order_id}. Se bloqueó la aprobación para evitar una sobre-venta.`,
      };
    }
  }

  const paymentId =
    manualPaymentRef?.trim() || order.paymentId || `manual-admin-${Date.now()}`;

  await finalizeApprovedOrder(order, paymentId);

  return {
    orderId,
    previousStatus: order.status,
    newStatus: 'approved',
    synced: true,
    paymentId,
    message: `Orden ${orderId} aprobada manualmente (Ref: ${paymentId}). Boleta registrada para ingreso y QR enviado a ${order.buyerInfo.email}.`,
  };
}

/**
 * Sweeps all pending orders from the last N hours (default 24h) and reconciles them against Wompi API.
 */
export async function syncAllPendingOrders(options?: {
  hoursBack?: number;
  force?: boolean;
}): Promise<{
  checkedCount: number;
  approvedCount: number;
  rejectedCount: number;
  stillPendingCount: number;
  results: ReconcileOrderResult[];
}> {
  const now = Date.now();
  if (!options?.force && now - lastSyncSweepAt < SYNC_SWEEP_THROTTLE_MS) {
    return {
      checkedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      stillPendingCount: 0,
      results: [],
    };
  }
  lastSyncSweepAt = now;

  const hoursBack = options?.hoursBack ?? 24;
  const sinceIso = new Date(now - hoursBack * 60 * 60 * 1000).toISOString();

  try {
    const { data: pendingRows, error } = await supabase
      .from('orders')
      .select('order_id, ticket_id, payment_method, status, created_at')
      .eq('status', 'pending')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false });

    if (error || !pendingRows || pendingRows.length === 0) {
      return {
        checkedCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        stillPendingCount: 0,
        results: [],
      };
    }

    // Only reconcile real orders (ORD-...), not unsubmitted form drafts (DRAFT-...)
    const realPendingRows = pendingRows.filter(
      (r: any) => !String(r.order_id || '').startsWith('DRAFT-')
    );

    const results: ReconcileOrderResult[] = [];
    let approvedCount = 0;
    let rejectedCount = 0;
    let stillPendingCount = 0;

    for (const row of realPendingRows) {
      const res = await verifyOrderWithWompi(row.order_id, {
        autoRejectOnDecline: true,
      });
      results.push(res);

      if (res.newStatus === 'approved') {
        approvedCount++;
      } else if (res.newStatus === 'rejected') {
        rejectedCount++;
      } else {
        stillPendingCount++;
      }
    }

    return {
      checkedCount: realPendingRows.length,
      approvedCount,
      rejectedCount,
      stillPendingCount,
      results,
    };
  } catch (err) {
    console.error('[WompiReconcile] Error sweeping pending orders:', err);
    return {
      checkedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      stillPendingCount: 0,
      results: [],
    };
  }
}
