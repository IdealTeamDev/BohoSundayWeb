import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from '@/lib/emailService';
import { supabase } from '@/lib/supabase';
import { getActiveEdition } from '@/lib/editions';

// ==========================================
// 1. CÓDIGO HTML EN ESPAÑOL (EMAILIFY FIGMA)
// ==========================================
const EMAIL_HTML_ES = `<!doctype html>
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
        <table role="presentation" class="emailify-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td width="600" style="width:100.0000%;padding:0;line-height:0;font-size:0;vertical-align:top;cursor:default!important;"><span role="presentation" aria-hidden="true" style="display:block;line-height:0;font-size:0;cursor:default!important;"><!--[if !mso]><!--><div style="max-height:0;max-width:600px;line-height:0;font-size:0;mso-hide:all;"><div style="max-width:600px;padding-bottom:202.5000%;opacity:0;line-height:0;font-size:0;" role="presentation" aria-hidden="true">&nbsp;</div></div><!--<![endif]--><img src="https://emailify-assets.santiago-5d0.workers.dev/campaigns/figma-mwyzycotgpqgoehslv-4001984/1351567578fa520960f4993d5f92de92.jpg" width="600" height="1215" border="0" draggable="false" role="presentation" alt="✉️ Mailing Recordatorio 24 horas antes del evento ES" style="display:block;width:100%;max-width:600px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;pointer-events:none!important;cursor:default!important;" /></span></td></tr></table></td></tr></table>
      </td></tr></table>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:transparent;"><tr><td height="20" aria-hidden="true" style="height:20px;line-height:20px;font-size:0;background-color:transparent;">&nbsp;</td></tr></table>
    </td></tr></table>
  </center>
</body>
</html>`;

// ==========================================
// 2. CÓDIGO HTML EN INGLÉS (EMAILIFY FIGMA)
// ==========================================
const EMAIL_HTML_EN = `<!doctype html>
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
        <table role="presentation" class="emailify-fluid" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr><td width="600" style="width:100.0000%;padding:0;line-height:0;font-size:0;vertical-align:top;cursor:default!important;"><span role="presentation" aria-hidden="true" style="display:block;line-height:0;font-size:0;cursor:default!important;"><!--[if !mso]><!--><div style="max-height:0;max-width:600px;line-height:0;font-size:0;mso-hide:all;"><div style="max-width:600px;padding-bottom:200.3333%;opacity:0;line-height:0;font-size:0;" role="presentation" aria-hidden="true">&nbsp;</div></div><!--<![endif]--><img src="https://emailify-assets.santiago-5d0.workers.dev/campaigns/figma-mwyzycotgpqgoehslv-40011127/ff887fff985677e8a79c7c236a2300ea.jpg" width="600" height="1202" border="0" draggable="false" role="presentation" alt="✉️ Mailing Recordatorio 24 horas antes del evento EN" style="display:block;width:100%;max-width:600px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;pointer-events:none!important;cursor:default!important;" /></span></td></tr></table></td></tr></table>
      </td></tr></table>
      <table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:transparent;"><tr><td height="20" aria-hidden="true" style="height:20px;line-height:20px;font-size:0;background-color:transparent;">&nbsp;</td></tr></table>
    </td></tr></table>
  </center>
</body>
</html>`;

// ==========================================
// 3. CONFIGURACIÓN DE ENVÍO
// ==========================================
// Hora programada: 19 de Diciembre de 2026, 10:00 AM (Hora Colombia: UTC-5 -> 15:00 UTC)
const TARGET_DATE_STRING = '2026-12-19T10:00:00-05:00';

// Asuntos del correo por idioma
const SUBJECT_ES = '✨ ¡Boho Sunday White Edition III es mañana!';
const SUBJECT_EN = '✨ Boho Sunday White Edition III is tomorrow!';

// Bandera en memoria para evitar envíos duplicados en el mismo contenedor
let hasBeenSentInContainer = false;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const testEmail = searchParams.get('testEmail');
    const testLang = (searchParams.get('lang') || 'es').toLowerCase();

    const now = new Date();
    const targetTime = new Date(TARGET_DATE_STRING);

    console.log(`[Scheduled Email] 🕒 Current time (UTC): ${now.toISOString()}`);
    console.log(`[Scheduled Email] 🎯 Target time (UTC): ${targetTime.toISOString()}`);

    // --- MODO DE PRUEBA: Permite enviar un correo de prueba a una dirección específica ---
    if (testEmail) {
      console.log(`[Scheduled Email] 🧪 Sending test email to: ${testEmail} (lang: ${testLang})`);
      const transport = createTransport();
      const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';
      const emailHtml = testLang === 'en' ? EMAIL_HTML_EN : EMAIL_HTML_ES;
      const emailSubject = testLang === 'en' ? `[TEST] ${SUBJECT_EN}` : `[TEST] ${SUBJECT_ES}`;

      await transport.sendMail({
        from: fromAddress,
        to: testEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: `Correo de prueba enviado exitosamente a ${testEmail}`,
        recipient: testEmail,
        language: testLang,
        sentAt: new Date().toISOString()
      });
    }

    // Evitar ejecuciones en años diferentes al 2026 para que sea un envío único
    if (now.getFullYear() !== 2026 && !force) {
      return NextResponse.json({
        success: false,
        message: `El envío programado está configurado estrictamente para el año 2026. Año actual: ${now.getFullYear()}.`,
        currentTime: now.toISOString(),
        targetTime: targetTime.toISOString()
      }, { status: 200 });
    }

    // Verificar si ya pasó la hora programada (con 5 minutos de tolerancia para servidores Vercel)
    const isPastTargetTime = now.getTime() >= (targetTime.getTime() - 5 * 60 * 1000);

    if (!isPastTargetTime && !force) {
      const secondsLeft = Math.ceil((targetTime.getTime() - now.getTime()) / 1000);
      return NextResponse.json({
        success: false,
        message: `Aún no es la hora programada. Faltan ${secondsLeft} segundos para el envío (19 de Diciembre, 10:00 AM Colombia).`,
        currentTime: now.toISOString(),
        targetTime: targetTime.toISOString()
      }, { status: 200 });
    }

    // Evitar re-envíos duplicados si el cron sigue ejecutándose continuamente en el mismo contenedor
    if (hasBeenSentInContainer && !force) {
      return NextResponse.json({
        success: false,
        message: 'El correo programado ya fue enviado en esta sesión del contenedor y no se volverá a enviar.'
      }, { status: 200 });
    }

    // Obtener la edición activa del evento
    const activeEdition = await getActiveEdition();
    const activeSlug = activeEdition?.slug || 'white-edition-iii';
    console.log(`[Scheduled Email] 🔍 Fetching buyers for active edition: "${activeSlug}"...`);

    // Filtrar estrictamente por la edición activa y excluir tickets inválidos
    const { data: records, error: dbError } = await supabase
      .from('purchased_tickets')
      .select('buyer_email, language, edition_slug, status')
      .eq('edition_slug', activeSlug)
      .neq('status', 'invalid');

    if (dbError) {
      throw new Error(`Database fetch error: ${dbError.message}`);
    }

    if (!records || records.length === 0) {
      console.warn(`[Scheduled Email] ⚠️ No records found in purchased_tickets for edition "${activeSlug}".`);
      return NextResponse.json({
        success: true,
        message: `No se encontraron compradores para la edición activa "${activeSlug}". No se envió ningún correo.`,
        recipientsCount: 0
      });
    }

    // Construir mapa único de emails y sus respectivos idiomas
    const buyerMap = new Map<string, string>(); // buyer_email (lowercase) -> language (es/en)
    records.forEach((row: any) => {
      const email = (row.buyer_email || '').trim().toLowerCase();
      if (email) {
        const lang = (row.language || 'es').toLowerCase() === 'en' ? 'en' : 'es';
        if (!buyerMap.has(email)) {
          buyerMap.set(email, lang);
        }
      }
    });

    const totalRecipients = buyerMap.size;
    console.log(`[Scheduled Email] 🚀 Initiating scheduled email send to ${totalRecipients} unique recipients of "${activeSlug}"...`);

    const transport = createTransport();
    const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';
    const sentList: string[] = [];

    // Enviar correo a cada destinatario único en su respectivo idioma
    for (const [email, lang] of buyerMap.entries()) {
      const emailHtml = lang === 'en' ? EMAIL_HTML_EN : EMAIL_HTML_ES;
      const emailSubject = lang === 'en' ? SUBJECT_EN : SUBJECT_ES;

      await transport.sendMail({
        from: fromAddress,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
      sentList.push(`${email} (${lang.toUpperCase()})`);
      console.log(`[Scheduled Email] ✅ Email (${lang.toUpperCase()}) successfully sent to ${email}`);
    }

    // Marcar como enviado en este contenedor
    if (!force) {
      hasBeenSentInContainer = true;
    }

    return NextResponse.json({
      success: true,
      message: `Correos de recordatorio para "${activeSlug}" enviados correctamente.`,
      edition: activeSlug,
      recipientsCount: totalRecipients,
      recipients: sentList,
      sentAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Scheduled Email] 🚨 Error sending scheduled email:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno al enviar el correo programado.',
      details: error.message || error
    }, { status: 500 });
  }
}
