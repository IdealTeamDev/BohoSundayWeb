import nodemailer from 'nodemailer';
import { tickets } from '@/data/tickets';
import type { BuyerInfo } from '@/types/checkout';

interface SendMailParams {
  ticketId: string;
  orderId: string;
  buyerInfo: BuyerInfo;
  quantity?: number;
}

/**
 * Creates the Nodemailer transport dynamically from environment variables
 */
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

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

/**
 * Downloads the QR code from the external API to embed it in the email
 */
async function fetchQrBuffer(orderId: string, ticketId: string, email: string): Promise<Buffer | null> {
  try {
    const qrData = encodeURIComponent(
      JSON.stringify({ orderId, ticketId, email })
    );
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching QR code buffer:', error);
    return null;
  }
}

/**
 * Sends a confirmation email to the buyer containing the ticket info and access QR code
 */
export async function sendConfirmationEmail({ ticketId, orderId, buyerInfo, quantity = 1 }: SendMailParams) {
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found in database.`);
  }

  const isIndividual = ticket.stock !== undefined;
  const totalQty = isIndividual ? quantity : 1;
  const totalPrice = ticket.price * totalQty;
  const formattedPrice = new Intl.NumberFormat('es-CO').format(totalPrice);

  // Fetch QR Buffer
  const qrBuffer = await fetchQrBuffer(orderId, ticketId, buyerInfo.email);

  const transport = createTransport();
  const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';

  // Build Includes List / Details HTML based on ticket type
  let detailsHtml = '';
  if (isIndividual) {
    detailsHtml = `
      <div style="background-color: #FAF8F5; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left; border: 1px solid #E8E2DA;">
        <p style="margin: 0 0 8px 0; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7A6F5E; letter-spacing: 0.5px;">Detalles de Entrada</p>
        <p style="margin: 0 0 6px 0; font-family: 'Nunito', sans-serif; font-size: 14px; color: #231E1A;">
          <strong>Horario de Ingreso:</strong> ${ticket.includes.licor}
        </p>
        <p style="margin: 0; font-family: 'Nunito', sans-serif; font-size: 14px; color: #231E1A;">
          <strong>Cantidad de Entradas:</strong> ${totalQty} ${totalQty === 1 ? 'acceso' : 'accesos'}
        </p>
      </div>
    `;
  } else {
    const includesList = [
      ticket.includes.licor,
      ticket.includes.agua > 0 ? `${ticket.includes.agua} Aguas` : '',
      ticket.includes.redBull > 0 ? `${ticket.includes.redBull} Red Bulls` : '',
    ].filter(Boolean);

    detailsHtml = `
      <div style="background-color: #FAF8F5; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left; border: 1px solid #E8E2DA;">
        <p style="margin: 0 0 8px 0; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7A6F5E; letter-spacing: 0.5px;">Beneficios Incluidos</p>
        <ul style="margin: 0; padding-left: 20px; font-family: 'Nunito', sans-serif; font-size: 14px; color: #231E1A; line-height: 1.6;">
          ${includesList.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <p style="margin: 10px 0 0 0; font-family: 'Nunito', sans-serif; font-size: 14px; color: #231E1A;">
          <strong>Capacidad de Mesa:</strong> ${ticket.persons} accesos
        </p>
      </div>
    `;
  }

  // Compose Email HTML
  const mailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Tu reserva para Boho Sunday está confirmada!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; -webkit-text-size-adjust: none; text-size-adjust: none;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF8F5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #F4EFE9; border-radius: 20px; border: 1px solid #BDB39B; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center;">
          
          <!-- Banner Header Image -->
          <tr>
            <td>
              <img src="https://bohosunday.com/images/background/background-finalcompra.png" alt="Boho Sunday Header" style="width: 100%; height: auto; display: block;" />
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px 24px 20px 24px;">
              
              <!-- Palm Logo Icon -->
              <img src="cid:palm-logo" alt="Palm Icon" width="36" height="36" style="margin-bottom: 12px; display: inline-block;" />

              <!-- Headline -->
              <h1 style="margin: 0 0 16px 0; font-family: sans-serif; font-size: 26px; font-weight: normal; color: #231E1A; letter-spacing: 1px; text-transform: uppercase;">
                ¡Reserva Confirmada!
              </h1>

              <!-- Confirmation Text -->
              <p style="margin: 0 0 24px 0; font-family: 'Nunito', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #5A5248; text-align: left;">
                Gracias por ser parte de esta experiencia. Adjuntamos tu código QR de acceso, el cual deberás presentar el día del evento.
              </p>

              <!-- Event Details Block -->
              <div style="background-color: #EBCB9D; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 6px 0; font-family: 'Nunito', sans-serif; font-size: 15px; color: #CF6E19;">
                  📍 <strong>Lugar:</strong> Casa Candela
                </p>
                <p style="margin: 0; font-family: 'Nunito', sans-serif; font-size: 15px; color: #CF6E19;">
                  📅 <strong>Fecha:</strong> 26 de julio
                </p>
              </div>

              <div style="height: 1px; background-color: #BDB39B; opacity: 0.5; margin-bottom: 20px;"></div>

              <!-- Ticket Info Block -->
              <h2 style="margin: 0 0 4px 0; font-family: sans-serif; font-size: 20px; font-weight: bold; color: #231E1A; letter-spacing: 0.5px; text-transform: uppercase;">
                ${ticket.name}${!isIndividual ? ` #${ticket.number}` : ''}
              </h2>
              <p style="margin: 0; font-family: 'Nunito', sans-serif; font-size: 13px; color: #7A6F5E;">
                Orden: <strong>${orderId}</strong>
              </p>

              <!-- Dynamic Details (Includes/Quantity) -->
              ${detailsHtml}

              <!-- QR Placement -->
              ${qrBuffer ? `
                <div style="background-color: #BDB39B; border-radius: 16px; padding: 12px; margin: 24px auto; width: 180px; display: inline-block;">
                  <img src="cid:qr-code" alt="Código QR de Acceso" width="180" height="180" style="border-radius: 8px; display: block;" />
                </div>
              ` : `
                <p style="color: #7A6F5E; font-size: 13px; margin: 20px 0;">(El código QR de acceso se adjunta como archivo PNG en este correo)</p>
              `}

              <!-- Price summary -->
              <p style="margin: 16px 0 6px 0; font-family: sans-serif; font-size: 12px; text-transform: uppercase; color: #7A6F5E; letter-spacing: 0.5px;">Valor Total Pagado</p>
              <h3 style="margin: 0 0 24px 0; font-family: 'Nunito', sans-serif; font-size: 28px; font-weight: bold; color: #231E1A;">
                $${formattedPrice} COP
              </h3>

              <div style="height: 1px; background-color: #BDB39B; opacity: 0.5; margin-bottom: 24px;"></div>

              <!-- Closing info -->
              <p style="margin: 0 0 16px 0; font-family: 'Nunito', sans-serif; font-size: 14px; line-height: 1.5; color: #5A5248; text-align: left;">
                Te recomendamos guardar este mensaje para tener tu ingreso a la mano.
              </p>
              <p style="margin: 0; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: bold; color: #686A54; line-height: 1.5; text-align: left;">
                ¡Nos vemos pronto para vivir una tarde de moda, música y buena energía!
              </p>

            </td>
          </tr>
          
          <!-- Footer Branding -->
          <tr>
            <td style="background-color: #231E1A; padding: 20px; color: #F4EFE9; font-family: 'Nunito', sans-serif; font-size: 12px;">
              © ${new Date().getFullYear()} Boho Sunday. Todos los derechos reservados.<br />
              Casa Candela, Sopetrán, Antioquia.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Attachments definition
  const attachments: any[] = [
    {
      filename: 'icon-palm.png',
      path: `${process.cwd()}/public/images/icon/icon-general.png`,
      cid: 'palm-logo', // matches <img src="cid:palm-logo" />
    }
  ];

  if (qrBuffer) {
    attachments.push({
      filename: 'boho-sunday-qr.png',
      content: qrBuffer,
      cid: 'qr-code', // matches <img src="cid:qr-code" />
    });
  }

  // Send the actual email
  await transport.sendMail({
    from: fromAddress,
    to: buyerInfo.email,
    subject: '¡Tu reserva para Boho Sunday está confirmada!',
    html: mailHtml,
    attachments,
  });
}
