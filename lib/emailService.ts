import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { getDynamicTickets } from '@/lib/tickets';
import type { BuyerInfo } from '@/types/checkout';
import type { OrderDetail } from './orderStore';

interface SendMailParams {
  ticketId: string;
  orderId: string;
  buyerInfo: BuyerInfo;
  quantity?: number;
}

// ==========================================
// CÓDIGO HTML CONFIRMACIÓN RESERVA EN INGLÉS (EMAILIFY FIGMA)
// ==========================================
export const EMAIL_HTML_EN = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Email</title>
  <style type="text/css">
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    html,body{margin:0!important;padding:0!important;width:100%!important;background:#f4f4f4;}
    table,td{border-collapse:collapse!important;mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;}
    img{-ms-interpolation-mode:bicubic;}
    .emailify-desktop{display:none;max-height:0;overflow:hidden;mso-hide:all;}
    .emailify-mobile{display:table;width:100%;max-height:none;overflow:visible;}
    .emailify-mobile img,.emailify-fluid img{width:100%!important;max-width:100%!important;height:auto!important;}
    @media only screen and (min-width:601px){
      .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
      .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
    .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <center style="width:100%;background-color:#f4f4f4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f4f4f4;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
        <table role="presentation" class="emailify-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td width="600" style="width:100.0000%;padding:0;line-height:0;font-size:0;vertical-align:top;cursor:default!important;"><span role="presentation" aria-hidden="true" style="display:block;line-height:0;font-size:0;cursor:default!important;"><!--[if !mso]><!--><div style="max-height:0;max-width:600px;line-height:0;font-size:0;mso-hide:all;"><div style="max-width:600px;padding-bottom:162.1667%;opacity:0;line-height:0;font-size:0;" role="presentation" aria-hidden="true">&nbsp;</div></div><!--<![endif]--><img src="https://emailify-assets.santiago-5d0.workers.dev/campaigns/figma-mwyzycotgpqgoehslv-4001662/8f889a737d75bcd5faedf867ca4d9ad9.jpg" width="600" height="973" border="0" draggable="false" role="presentation" alt="✉️ Mailing Confirmación reserva EN" style="display:block;width:100%;max-width:600px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;pointer-events:none!important;cursor:default!important;" /></span></td></tr></table></td></tr></table>
      </td></tr></table>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:transparent;"><tr><td height="20" aria-hidden="true" style="height:20px;line-height:20px;font-size:0;background-color:transparent;">&nbsp;</td></tr></table>
    </td></tr></table>
  </center>
</body>
</html>`;

// ==========================================
// CÓDIGO HTML CONFIRMACIÓN RESERVA EN ESPAÑOL (EMAILIFY FIGMA)
// ==========================================
export const EMAIL_HTML_ES = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Email</title>
  <style type="text/css">
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    html,body{margin:0!important;padding:0!important;width:100%!important;background:#f4f4f4;}
    table,td{border-collapse:collapse!important;mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;}
    img{-ms-interpolation-mode:bicubic;}
    .emailify-desktop{display:none;max-height:0;overflow:hidden;mso-hide:all;}
    .emailify-mobile{display:table;width:100%;max-height:none;overflow:visible;}
    .emailify-mobile img,.emailify-fluid img{width:100%!important;max-width:100%!important;height:auto!important;}
    @media only screen and (min-width:601px){
      .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
      .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
    .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <center style="width:100%;background-color:#f4f4f4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f4f4f4;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
        <table role="presentation" class="emailify-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td width="600" style="width:100.0000%;padding:0;line-height:0;font-size:0;vertical-align:top;cursor:default!important;"><span role="presentation" aria-hidden="true" style="display:block;line-height:0;font-size:0;cursor:default!important;"><!--[if !mso]><!--><div style="max-height:0;max-width:600px;line-height:0;font-size:0;mso-hide:all;"><div style="max-width:600px;padding-bottom:162.0000%;opacity:0;line-height:0;font-size:0;" role="presentation" aria-hidden="true">&nbsp;</div></div><!--<![endif]--><img src="https://emailify-assets.santiago-5d0.workers.dev/campaigns/figma-mwyzycotgpqgoehslv-200851/c4d3cf17bad7825a733621159a39ee29.jpg" width="600" height="972" border="0" draggable="false" role="presentation" alt="✉️ Mailing Confirmación reserva ES" style="display:block;width:100%;max-width:600px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;pointer-events:none!important;cursor:default!important;" /></span></td></tr></table></td></tr></table>
      </td></tr></table>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:transparent;"><tr><td height="20" aria-hidden="true" style="height:20px;line-height:20px;font-size:0;background-color:transparent;">&nbsp;</td></tr></table>
    </td></tr></table>
  </center>
</body>
</html>`;

// ==========================================
// CÓDIGO HTML RECUPERACIÓN CARRITO ABANDONADO EN ESPAÑOL (EMAILIFY FIGMA)
// ==========================================
export const ABANDONED_CART_HTML_ES = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Email</title>
  <style type="text/css">
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    html,body{margin:0!important;padding:0!important;width:100%!important;background:#f4f4f4;}
    table,td{border-collapse:collapse!important;mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;}
    img{-ms-interpolation-mode:bicubic;}
    .emailify-desktop{display:none;max-height:0;overflow:hidden;mso-hide:all;}
    .emailify-mobile{display:table;width:100%;max-height:none;overflow:visible;}
    .emailify-mobile img,.emailify-fluid img{width:100%!important;max-width:100%!important;height:auto!important;}
    @media only screen and (min-width:601px){
      .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
      .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
    .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <center style="width:100%;background-color:#f4f4f4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f4f4f4;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
        <table role="presentation" class="emailify-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td width="600" style="width:100.0000%;padding:0;line-height:0;font-size:0;vertical-align:top;cursor:pointer;"><a href="https://api.whatsapp.com/send?phone=573233114995" target="_blank" style="display:block;line-height:0;font-size:0;text-decoration:none;"><img src="https://emailify-assets.santiago-5d0.workers.dev/campaigns/figma-mwyzycotgpqgoehslv-4001761/165142cf6f4e3f1aaedaa189035e83ea.jpg" width="600" height="942" border="0" draggable="false" role="presentation" alt="✉️ Recuperación de carrito abandonado ES" style="display:block;width:100%;max-width:600px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;pointer-events:auto;cursor:pointer;" /></a></td></tr></table></td></tr></table>
      </td></tr></table>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:transparent;"><tr><td height="20" aria-hidden="true" style="height:20px;line-height:20px;font-size:0;background-color:transparent;">&nbsp;</td></tr></table>
    </td></tr></table>
  </center>
</body>
</html>`;

// ==========================================
// CÓDIGO HTML RECUPERACIÓN CARRITO ABANDONADO EN INGLÉS (EMAILIFY FIGMA)
// ==========================================
export const ABANDONED_CART_HTML_EN = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>Email</title>
  <style type="text/css">
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    html,body{margin:0!important;padding:0!important;width:100%!important;background:#f4f4f4;}
    table,td{border-collapse:collapse!important;mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;}
    img{-ms-interpolation-mode:bicubic;}
    .emailify-desktop{display:none;max-height:0;overflow:hidden;mso-hide:all;}
    .emailify-mobile{display:table;width:100%;max-height:none;overflow:visible;}
    .emailify-mobile img,.emailify-fluid img{width:100%!important;max-width:100%!important;height:auto!important;}
    @media only screen and (min-width:601px){
      .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
      .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    .emailify-desktop{display:table!important;width:100%!important;max-height:none!important;overflow:visible!important;}
    .emailify-mobile{display:none!important;max-height:0!important;overflow:hidden!important;mso-hide:all!important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <center style="width:100%;background-color:#f4f4f4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f4f4f4;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="padding:0;">
        <table role="presentation" class="emailify-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td width="600" style="width:100.0000%;padding:0;line-height:0;font-size:0;vertical-align:top;cursor:pointer;"><a href="https://api.whatsapp.com/send?phone=573233114995" target="_blank" style="display:block;line-height:0;font-size:0;text-decoration:none;"><img src="https://emailify-assets.santiago-5d0.workers.dev/campaigns/figma-mwyzycotgpqgoehslv-4001899/8a0c9ba14af22b41176d4ddf3cf432c2.jpg" width="600" height="942" border="0" draggable="false" role="presentation" alt="✉️ Recuperación de carrito abandonado EN" style="display:block;width:100%;max-width:600px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;pointer-events:auto;cursor:pointer;" /></a></td></tr></table></td></tr></table>
      </td></tr></table>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:transparent;"><tr><td height="20" aria-hidden="true" style="height:20px;line-height:20px;font-size:0;background-color:transparent;">&nbsp;</td></tr></table>
    </td></tr></table>
  </center>
</body>
</html>`;

export function createTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '').trim() : '';

  if (!host || !user || !pass) {
    console.warn('⚠️ SMTP credentials not fully configured in environment variables. Falling back to test logger.');
    // Return a dummy transport that logs email content
    return {
      sendMail: async (options: any) => {
        console.log(`[TEST EMAIL LOGGER]
To: ${options.to}
Subject: ${options.subject}
HTML content length: ${options.html?.length || 0}
Attachments count: ${options.attachments?.length || 0}
`);
        return { messageId: 'test-message-id' };
      }
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

async function fetchQrBuffer(orderId: string, ticketId: string, email: string): Promise<Buffer | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bohosunday.com';
    const qrUrl = `${siteUrl.replace(/\/$/, '')}/api/qrs/${orderId}`;
    const qrData = encodeURIComponent(qrUrl);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch QR code image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[Email Service] Error fetching QR code buffer:', error);
    return null;
  }
}

/**
 * Sends a confirmation email to the buyer containing the ticket info and access QR code
 */
export async function sendConfirmationEmail({ ticketId, orderId, buyerInfo, quantity = 1 }: SendMailParams) {
  const tickets = await getDynamicTickets(undefined, true, true);
  let ticket = tickets.find((t) => t.id === ticketId || t.id.toLowerCase() === ticketId.toLowerCase());
  
  if (!ticket) {
    console.warn(`[Email Service] ⚠️ Ticket with ID "${ticketId}" not found in dynamic list. Using fallback ticket details.`);
    ticket = {
      id: ticketId,
      name: ticketId.includes('-') ? `Mesa (${ticketId})` : `Entrada (${ticketId})`,
      price: 0,
      zone: 'general' as const,
      number: 0,
      persons: 1,
      currency: 'COP',
      img: '',
      includes: { licor: '', agua: 0, redBull: 0 },
      position: { x: 0, y: 0 },
      available: true
    };
  }

  const qrBuffer = await fetchQrBuffer(orderId, ticketId, buyerInfo.email);

  const transport = createTransport();
  const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';

  const isEnglish = buyerInfo.locale === 'en';

  // Compose Email HTML
  const mailHtml = isEnglish ? EMAIL_HTML_EN : EMAIL_HTML_ES;

  // Attachments definition (Only the QR Code as a downloadable file attachment, no CID/inline required)
  const attachments: any[] = [];

  if (qrBuffer) {
    attachments.push({
      filename: (() => {
        const cleanBuyer = (buyerInfo.name || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        const cleanTicket = (ticket?.name || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        const parts = ['QR', cleanBuyer, cleanTicket].filter(Boolean);
        return `${parts.join('_')}.png`;
      })(),
      content: qrBuffer,
    });
  }

  // Send the actual email
  await transport.sendMail({
    from: fromAddress,
    to: buyerInfo.email,
    subject: isEnglish ? 'Your Boho Sunday reservation is confirmed!' : '¡Tu reserva para Boho Sunday está confirmada!',
    html: mailHtml,
    attachments,
  });
}

/**
 * Sends an abandoned cart / failed payment recovery email to the buyer in ES or EN.
 */
export async function sendAbandonedCartEmail({
  email,
  locale,
}: {
  email: string;
  locale?: string;
}) {
  const cleanEmail = (email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    console.warn(`[Email Service] ⚠️ Skipping abandoned cart email: invalid email "${cleanEmail}"`);
    return;
  }

  const transport = createTransport();
  const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';
  const isEnglish = (locale || '').toLowerCase() === 'en';

  const mailHtml = isEnglish ? ABANDONED_CART_HTML_EN : ABANDONED_CART_HTML_ES;
  const subject = isEnglish
    ? 'Did you run into any issues with your Boho Sunday reservation?'
    : '¿Tuviste algún inconveniente con tu reserva para Boho Sunday?';

  await transport.sendMail({
    from: fromAddress,
    to: cleanEmail,
    subject,
    html: mailHtml,
  });

  console.log(`[Email Service] 📩 Abandoned cart / recovery email (${isEnglish ? 'EN' : 'ES'}) sent to ${cleanEmail}`);
}

export async function sendAdminNotificationEmail(order: OrderDetail, status: 'approved' | 'rejected') {
  try {
    const tickets = await getDynamicTickets(undefined, true, true);
    const ticket = tickets.find((t) => t.id === order.ticketId);

    const ticketName = ticket?.name || 'Boleto/Cama';
    const ticketNumber = ticket?.number || 0;
    const zone = ticket?.zone || 'general';

    // Calculate total capacity (persons per ticket * quantity)
    const basePersons = ticket ? (ticket.stock !== undefined ? 1 : (ticket.persons || 1)) : 1;
    const totalAccesos = basePersons * order.quantity;
    
    // Checksum: unique hash of the order details
    const checksum = crypto
      .createHash('sha256')
      .update(`${order.orderId}-${order.buyerInfo.email}-${order.paymentId || ''}-${status}`)
      .digest('hex')
      .substring(0, 16);

    const jsonStatus = status === 'approved' ? 'paid' : 'failed';

    const orderJson = {
      order_id: order.orderId,
      ticket_id: order.ticketId,
      ticket_name: ticketName,
      ticket_number: ticketNumber,
      zone: zone,
      buyer_name: order.buyerInfo.name,
      buyer_email: order.buyerInfo.email,
      buyer_phone: order.buyerInfo.phone,
      total_accesos: totalAccesos,
      accesos_restantes: totalAccesos,
      status: jsonStatus,
      checksum: checksum,
      payment_ref: order.paymentId || order.errorDetail || 'N/A',
      created_at: new Date(order.createdAt).toISOString(),
      ticket_price: ticket?.price || 0
    };

    const transport = createTransport();
    const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';
    const emailAlejandra = 'alejandra@idealteamcolombia.com, elizabeth@idealteamcolombia.com';
    const emailCoordinacion = 'coordinacionreservas@casacandela.co';

    // Fetch client QR code buffer to attach to the email
    const qrBuffer = await fetchQrBuffer(order.orderId, order.ticketId, order.buyerInfo.email);
    const attachments: any[] = [];
    if (qrBuffer) {
      attachments.push({
        filename: (() => {
          const cleanBuyer = (order.buyerInfo.name || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          const cleanTicket = (ticketName || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          const parts = ['QR', cleanBuyer, cleanTicket, order.orderId].filter(Boolean);
          return `${parts.join('_')}.png`;
        })(),
        content: qrBuffer,
      });
    }

    const subject = status === 'approved' 
      ? `🟢 Compra EXITOSA - Orden ${order.orderId}`
      : `🔴 Compra FALLIDA - Orden ${order.orderId}`;

    const baseHtmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: ${status === 'approved' ? '#2e7d32' : '#c62828'}; border-bottom: 2px solid ${status === 'approved' ? '#2e7d32' : '#c62828'}; padding-bottom: 10px; margin-top: 0;">
          ${status === 'approved' ? '🟢 Nueva Compra Exitosa' : '🔴 Compra Fallida/Rechazada'}
        </h2>
        <p>Se ha registrado una transacción en Boho Sunday:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px;">ID Orden:</td>
            <td style="padding: 8px 0;">${order.orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Cliente:</td>
            <td style="padding: 8px 0;">${order.buyerInfo.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Correo:</td>
            <td style="padding: 8px 0;">${order.buyerInfo.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Celular:</td>
            <td style="padding: 8px 0;">${order.buyerInfo.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Producto:</td>
            <td style="padding: 8px 0;">${ticketName} (Cant: ${order.quantity})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Referencia Pago:</td>
            <td style="padding: 8px 0; font-family: monospace;">${order.paymentId || order.errorDetail || 'N/A'}</td>
          </tr>
        </table>
        ${status === 'approved' ? '<p style="color: #2e7d32; font-weight: bold;">El código QR generado para el cliente ha sido adjuntado a este correo.</p>' : ''}
    `;

    // HTML for Alejandra (with JSON block)
    const htmlWithJson = `
      ${baseHtmlContent}
        <p><strong>JSON de la Compra (para tus registros):</strong></p>
        <pre style="background: #1e1e1e; color: #a9b7c6; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: monospace; font-size: 13px; line-height: 1.5;">${JSON.stringify(orderJson, null, 2)}</pre>
      </div>
    `;

    // HTML for Coordinacion Reservas (without JSON block)
    const htmlWithoutJson = `
      ${baseHtmlContent}
      </div>
    `;

    // Send to Alejandra (with JSON)
    await transport.sendMail({
      from: fromAddress,
      to: emailAlejandra,
      subject: subject,
      html: htmlWithJson,
      attachments,
    });
    console.log(`[Admin Notification] Email with JSON sent successfully to ${emailAlejandra} for Order ${order.orderId} (Status: ${status})`);

    // Send to Coordinacion Reservas (without JSON)
    await transport.sendMail({
      from: fromAddress,
      to: emailCoordinacion,
      subject: subject,
      html: htmlWithoutJson,
      attachments,
    });
    console.log(`[Admin Notification] Email without JSON sent successfully to ${emailCoordinacion} for Order ${order.orderId} (Status: ${status})`);

  } catch (error) {
    console.error(`[Admin Notification] ❌ Error sending admin notification email:`, error);
  }
}

/**
 * Sends a security alert email when admin login attempts exceed limit and get locked out.
 */
export async function sendSecurityAlertEmail({
  username,
  ip,
  attemptsCount,
}: {
  username: string;
  ip?: string;
  attemptsCount: number;
}) {
  try {
    const transport = createTransport();
    const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday Security" <reservas@bohosunday.com>';
    const recipients = [
      'alejandra@idealteamcolombia.com',
      'idealdeveloperweb@gmail.com',
      'idealteamcolombia@gmail.com',
      'elizabeth@idealteamcolombia.com',
    ];

    const timestamp = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #111827;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ef4444;">
          <h1 style="color: #dc2626; margin: 0; font-size: 22px;">🚨 Alerta de Seguridad: Bloqueo de Inicios de Sesión</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Panel de Administración - Boho Sunday Web</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px; line-height: 1.5; color: #374151;">
            Se han detectado múltiples intentos fallidos de inicio de sesión en el sistema administrativo de Boho Sunday. El acceso ha sido <strong>bloqueado por 5 minutos</strong> de manera preventiva.
          </p>

          <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563; width: 40%;">Usuario Intentado:</td>
              <td style="padding: 12px 16px; font-weight: bold; color: #111827;">${username}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">Intentos Fallidos:</td>
              <td style="padding: 12px 16px; color: #dc2626; font-weight: bold;">${attemptsCount} intentos consecutivo(s)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">Dirección IP:</td>
              <td style="padding: 12px 16px; font-family: monospace; color: #111827;">${ip || 'No disponible'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">Fecha y Hora:</td>
              <td style="padding: 12px 16px; color: #111827;">${timestamp}</td>
            </tr>
          </table>

          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">
              <strong>Acción tomada:</strong> Los intentos de inicio de sesión con este usuario/IP quedan suspendidos durante 5 minutos.
            </p>
          </div>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
          Este es un correo automático del sistema de monitoreo de seguridad de Boho Sunday Web.
        </div>
      </div>
    `;

    await transport.sendMail({
      from: fromAddress,
      to: recipients.join(', '),
      subject: `🚨 ALERTA DE SEGURIDAD: Bloqueo de inicio de sesión (${username})`,
      html,
    });

    console.log(`[Security Alert] Security alert email successfully sent to ${recipients.join(', ')} for user: ${username}`);
  } catch (error) {
    console.error(`[Security Alert] ❌ Error sending security alert email:`, error);
  }
}