import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const CUSTOMER_NAME = 'Malkun Pimentel';
const CUSTOMER_EMAIL = 'bpmalkum@gmail.com';
const TEST_EMAIL = 'alejandra@idealteamcolombia.com';

const EMAIL_HTML = `<!doctype html>
<html lang="es" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<title>Aclaración sobre tu reserva - Boho Sunday</title>
<!--[if !mso]><!-->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--<![endif]-->
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style type="text/css">

#outlook a { padding:0; }
body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
p { display:block;margin:13px 0; }
</style>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<!--[if lte mso 11]>
<style type="text/css">

.h { width:100% !important; }
</style>
<![endif]-->
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Inter:400,800,500,700" rel="stylesheet" type="text/css">
<!--<![endif]-->
<style type="text/css">

@media only screen and (min-width:600px) {
.p { width:568px !important; max-width: 568px; }
.c { width:600px !important; max-width: 600px; }
.f { width:450px !important; max-width: 450px; }
.j { width:418px !important; max-width: 418px; }
.k { width:536px !important; max-width: 536px; }
}
</style>
<style media="screen and (min-width:600px)">
.moz-text-html .p { width:568px !important; max-width: 568px; }
.moz-text-html .c { width:600px !important; max-width: 600px; }
.moz-text-html .f { width:450px !important; max-width: 450px; }
.moz-text-html .j { width:418px !important; max-width: 418px; }
.moz-text-html .k { width:536px !important; max-width: 536px; }
</style>
<style type="text/css">

@media only screen and (max-width:599px) {
table.m { width: 100% !important; }
td.m { width: auto !important; }
}
</style>
<style type="text/css">

body {
-webkit-font-smoothing:antialiased;
-moz-osx-font-smoothing:grayscale;
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
}
[data-markjs] { color: inherit; padding: 0; background: none; }
#MessageViewBody a {
color: inherit !important;
text-decoration: none!important;
}
[x-apple-data-detectors-type="calendar-event"] { color: inherit !important; -webkit-text-decoration-color: inherit !important; }
u + .emailify a[href^="tel:"],
u + .emailify a[href^="mailto:"],
u + .emailify a[href*="maps.google"] {
color: inherit !important;
text-decoration: none !important;
}
@media only screen and (max-width:599px) {
.emailify { height:100% !important; margin:0 !important; padding:0 !important; width:100% !important; }
.m img { width: 100%!important; max-width: 100%!important; height: auto!important; }
div.r > table > tbody > tr > td { direction: ltr!important; }
img { background-color: transparent!important; }
div.r.e > table > tbody > tr > td, div.r.e > div > table > tbody > tr > td { padding-right:16px!important }
div.r.y > table > tbody > tr > td, div.r.y > div > table > tbody > tr > td { padding-left:16px!important }
div.r.pt-0 > table > tbody > tr > td, div.r.pt-0 > div > table > tbody > tr > td { padding-top:0px!important }
div.r.pr-0 > table > tbody > tr > td, div.r.pr-0 > div > table > tbody > tr > td { padding-right:0px!important }
div.r.pb-0 > table > tbody > tr > td, div.r.pb-0 > div > table > tbody > tr > td { padding-bottom:0px!important }
div.r.pl-0 > table > tbody > tr > td, div.r.pl-0 > div > table > tbody > tr > td { padding-left:0px!important }
td.x.qk span, td.x.qk p, td.x.qk a, td.x.qk ol, td.x.qk ul, td.x.qk div, td.x.qk { font-size:20px!important }
td.x.pj span, td.x.pj p, td.x.pj a, td.x.pj ol, td.x.pj ul, td.x.pj div, td.x.pj { line-height:24px!important }
td.x.t span, td.x.t p, td.x.t a, td.x.t ol, td.x.t ul, td.x.t div, td.x.t { font-size:14px!important }
td.x.s span, td.x.s p, td.x.s a, td.x.s ol, td.x.s ul, td.x.s div, td.x.s { line-height:18px!important }
td.x.n span, td.x.n p, td.x.n a, td.x.n ol, td.x.n ul, td.x.n div, td.x.n { line-height:24px!important }
}
</style>
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<!--[if gte mso 9]>
<style>
a:link {
mso-style-priority: 99;
color: inherit;
text-decoration: none;
}
a:visited {
mso-style-priority: 99;
color: inherit;
text-decoration: none;
}
li { margin-left: -1em !important }
table, td, p, div, span, ul, ol, li, a, h1, h2, h3, h4, h5, h6 {
mso-hyphenate: none;
}
sup, sub { font-size: 100% !important; }
img { background-color: transparent !important; }
</style>
<![endif]-->
</head>
<body lang="es" link="#2C6FF2" vlink="#2C6FF2" class="emailify" style="mso-line-height-rule: exactly; mso-hyphenate: none; word-wrap: normal; word-spacing: normal; background-color: #1e1e1e;">
<style data-emailify-desktop-column-width-fallback type="text/css">
@media only screen and (min-width:600px) {
.p { width:568px !important; max-width: 568px; }
.c { width:600px !important; max-width: 600px; }
.f { width:450px !important; max-width: 450px; }
.j { width:418px !important; max-width: 418px; }
.k { width:536px !important; max-width: 536px; }
}
</style>
<div style="background-color:#1e1e1e;" lang="es" dir="auto">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->

<!-- HEADER LOGO -->
<div class="r e y" style="background:#a94a34;background-color:#a94a34;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#a94a34;background-color:#a94a34;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 16px 16px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:238px;">
<img alt="Boho Sunday Logo" src="https://e.hypermatic.com/f854eb869b5cb1a100c4794e37a7d354.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="238">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>

<!-- HERO BANNER IMAGE -->
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r pt-0 pr-0 pb-0 pl-0" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffffe;background-color:#fffffe;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:0;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="m">
<tbody>
<tr>
<td style="width:600px;" class="m">
<img alt="Boho Sunday Header" src="https://e.hypermatic.com/31c49f0b8ddcf67843a1527607cc19ca.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>

<!-- TITLE SECTION -->
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:30px 40px 10px 40px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:520px;"><![endif]-->
<div class="f h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x qk pj" style="font-size:0;word-break:break-word;">
<div style="font-family:'Gritor', 'Arial', sans-serif;font-size:24px;font-weight:700;line-height:120%;text-align:center;text-transform:uppercase;color:#231e1a;">
  <p style="Margin:0;mso-line-height-alt:28px;font-size:24px;line-height:120%;">
    <span style="letter-spacing:-0.5px;">Aclaración Importante sobre tu Reserva</span>
  </p>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>

<!-- BODY CONTENT -->
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:10px 45px 20px 45px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:510px;"><![endif]-->
<div class="j h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="left" class="x t s" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:15px;font-weight:400;line-height:150%;text-align:left;color:#231e1a;">
  <p style="Margin:0 0 14px 0;">Hola <strong>${CUSTOMER_NAME}</strong>,</p>
  <p style="Margin:0 0 14px 0;">Te escribimos para informarte que, por un error involuntario de nuestra parte, se te generó una boleta tipo <strong>Anytime</strong>.</p>
  <p style="Margin:0 0 14px 0;">Queremos confirmarte que <strong>ya realizamos la cancelación e invalidación de dicha boleta tipo Anytime</strong>.</p>
  <p style="Margin:0 0 14px 0; background-color:#ffffff; padding:14px; border-left:4px solid #a94a34; border-radius:4px;">
    <strong>Tu compra de CAMA LUJO PRIMITIVO está totalmente intacta y confirmada.</strong>
  </p>
  <p style="Margin:0 0 12px 0;">Por favor toma en cuenta las siguientes indicaciones:</p>
  <ul style="Margin:0 0 16px 0; padding-left:20px; line-height:160%;">
    <li style="margin-bottom:8px;"><strong>Ignore el correo del Anytime:</strong> Haz caso omiso al correo que contiene el código QR de la boleta Anytime, ya que ha quedado completamente invalidado.</li>
    <li style="margin-bottom:8px;"><strong>Utiliza tu entrada Lujo Primitivo:</strong> Puedes usar tu código QR de la entrada <strong>CAMA LUJO PRIMITIVO</strong> sin ningún tipo de problema el día del evento.</li>
  </ul>
  <p style="Margin:0 0 14px 0;">Lamentamos sinceramente los inconvenientes que este malentendido haya podido causarte.</p>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>

<!-- EVENT LOCATION & DATE SUMMARY -->
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:14px 32px 16px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t n" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:15px;font-weight:500;line-height:150%;text-align:center;text-transform:uppercase;color:#5d5d5d;">
  <p style="Margin:0;mso-line-height-alt:24px;font-size:15px;line-height:150%;">
    <span style="font-weight:800;">Lugar: </span>Casa Candela
  </p>
  <p style="Margin:0;mso-line-height-alt:24px;font-size:15px;line-height:150%;">
    <span style="font-weight:800;">FECHA: </span>18 DE OCTUBRE <span style="font-size:10px;mso-line-height-alt:15px;">|</span> <span style="font-weight:800;"> HORA: </span>10 a.m.
  </p>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>

<!-- CLOSING REMARK -->
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:5px 75px 40px 75px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:450px;"><![endif]-->
<div class="f h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t s" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:131%;text-align:center;color:#a94a34;">
  <p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">¡Nos vemos pronto para vivir una tarde inolvidable de moda, música y buena energía!</p>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>

<!-- FOOTER SECTION -->
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#1e1e1e;background-color:#1e1e1e;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#1e1e1e;background-color:#1e1e1e;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:24px 16px 24px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x" style="font-size:0;padding-bottom:16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:13px;font-weight:400;letter-spacing:19px;line-height:115%;text-align:center;color:#4d4d4d;">
  <p style="Margin:0;mso-line-height-alt:15px;font-size:13px;line-height:115%;">CASA CANDELA</p>
</div>
</td>
</tr>
<tr>
<td align="center" class="x" style="font-size:0;padding-bottom:16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:14px;font-weight:400;line-height:157%;text-align:center;color:#d9d1c0;">
  <p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:157%;">Tafetanes, Vía Antigua a Sopetrán, Antioquia</p>
  <p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:183%;">
    <span style="font-size:12px;font-weight:700;line-height:183%;letter-spacing:2px;text-transform:uppercase;">www.casacandela.co</span>
  </p>
</div>
</td>
</tr>
<tr>
<td align="center" style="font-size:0;padding:0;padding-bottom:0;word-break:break-word;">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td><![endif]-->
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
<tbody>
<tr>
<td style="padding:0 16px 0 0;vertical-align:middle;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:24px;">
<tbody>
<tr>
<td style="font-size:0;height:24px;vertical-align:middle;width:24px;">
<a href="https://www.instagram.com/casacandela.co/" target="_blank">
<img alt="Instagram" height="24" src="https://e.hypermatic.com/0feda55cb30db8d1464c2097a3aad4bb.png" style="display:block;" width="24">
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<!--[if mso | IE]></td><td><![endif]-->
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
<tbody>
<tr>
<td style="padding:0 16px 0 0;vertical-align:middle;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:24px;">
<tbody>
<tr>
<td style="font-size:0;height:24px;vertical-align:middle;width:24px;">
<a href="https://www.facebook.com/casacandelaco" target="_blank">
<img alt="Facebook" height="24" src="https://e.hypermatic.com/9b77b1191ee06a4222b39733471af6ef.png" style="display:block;" width="24">
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<!--[if mso | IE]></td><td><![endif]-->
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;">
<tbody>
<tr>
<td style="padding:0;padding-right:0;vertical-align:middle;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:24px;">
<tbody>
<tr>
<td style="font-size:0;height:24px;vertical-align:middle;width:24px;">
<a href="https://wa.link/s64zsh" target="_blank">
<img alt="WhatsApp" height="24" src="https://e.hypermatic.com/45e79b24e2181becd378fe3ec69a8cce.png" style="display:block;" width="24">
</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</div>
</body>
</html>`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action'); // 'test' | 'client'

  if (action !== 'test' && action !== 'client') {
    return NextResponse.json(
      {
        error: "Parámetro invalido. Usa ?action=test para enviar la prueba a Alejandra, o ?action=client para enviar al cliente.",
        usage: {
          test: "/api/admin/send-clarification?action=test",
          client: "/api/admin/send-clarification?action=client",
        }
      },
      { status: 400 }
    );
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '').trim();

  if (!host || !user || !pass) {
    return NextResponse.json(
      { error: "Credenciales de SMTP no configuradas en el entorno." },
      { status: 500 }
    );
  }

  const targetEmail = action === 'test' ? TEST_EMAIL : CUSTOMER_EMAIL;
  const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';
  const subject = action === 'test'
    ? `[PRUEBA EN PRODUCCIÓN] Aclaración sobre boleta Anytime - Cliente: ${CUSTOMER_NAME}`
    : `Aclaración sobre tu reserva Boho Sunday - ${CUSTOMER_NAME}`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject: subject,
      html: EMAIL_HTML,
    });

    return NextResponse.json({
      success: true,
      mode: action,
      targetEmail,
      messageId: info.messageId,
      detail: action === 'test'
        ? `Correo de prueba enviado con éxito a ${targetEmail}. Revisa tu bandeja de entrada.`
        : `Correo definitivo enviado con éxito al cliente ${CUSTOMER_NAME} (${targetEmail}).`
    });

  } catch (error: any) {
    console.error('[Send Clarification API Error]:', error);
    return NextResponse.json(
      {
        error: "Error al enviar el correo",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
