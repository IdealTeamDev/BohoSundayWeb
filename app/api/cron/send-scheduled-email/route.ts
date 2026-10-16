import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from '@/lib/emailService';
import { supabase } from '@/lib/supabase';
import { getActiveEdition } from '@/lib/editions';

// ==========================================
// 1. CÓDIGO HTML EN ESPAÑOL (EMAILIFY FIGMA)
// ==========================================
const EMAIL_HTML_ES = `
<!doctype html>
<html lang="en" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<title></title>
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
.o { width:486px !important; max-width: 486px; }
.k { width:536px !important; max-width: 536px; }
.ok { width:100% !important; max-width: 100%; }
.d { width:48.4496% !important; max-width: 48.4496%; }
.ks { width:3.1008% !important; max-width: 3.1008%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
.e { width:440px !important; max-width: 440px; }
}
</style>
<style media="screen and (min-width:600px)">
.moz-text-html .p { width:568px !important; max-width: 568px; }
.moz-text-html .c { width:600px !important; max-width: 600px; }
.moz-text-html .o { width:486px !important; max-width: 486px; }
.moz-text-html .k { width:536px !important; max-width: 536px; }
.moz-text-html .ok { width:100% !important; max-width: 100%; }
.moz-text-html .d { width:48.4496% !important; max-width: 48.4496%; }
.moz-text-html .ks { width:3.1008% !important; max-width: 3.1008%; }
.moz-text-html .m { width:10.0971% !important; max-width: 10.0971%; }
.moz-text-html .u { width:4.2718% !important; max-width: 4.2718%; }
.moz-text-html .l { width:82.3301% !important; max-width: 82.3301%; }
.moz-text-html .j { width:3.301% !important; max-width: 3.301%; }
.moz-text-html .e { width:440px !important; max-width: 440px; }
</style>
<style type="text/css">

@media only screen and (max-width:599px) {
table.mq { width: 100% !important; }
td.mq { width: auto !important; }
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
}div.wa { font-size: 0; }
@media only screen and (max-width:599px) {
.emailify { height:100% !important; margin:0 !important; padding:0 !important; width:100% !important; }
.mq img { width: 100%!important; max-width: 100%!important; height: auto!important; }
br.s { display: none!important; }
td.b td { background-size: cover!important; }
div.r > table > tbody > tr > td { direction: ltr!important; }
img { background-color: transparent!important; }
div.r.ey > table > tbody > tr > td, div.r.ey > div > table > tbody > tr > td { padding-right:16px!important }
div.r.y > table > tbody > tr > td, div.r.y > div > table > tbody > tr > td { padding-left:16px!important }
div.r.pt-0 > table > tbody > tr > td, div.r.pt-0 > div > table > tbody > tr > td { padding-top:0px!important }
div.r.pr-0 > table > tbody > tr > td, div.r.pr-0 > div > table > tbody > tr > td { padding-right:0px!important }
div.r.pb-0 > table > tbody > tr > td, div.r.pb-0 > div > table > tbody > tr > td { padding-bottom:0px!important }
div.r.pl-0 > table > tbody > tr > td, div.r.pl-0 > div > table > tbody > tr > td { padding-left:0px!important }
td.x.t span, td.x.t p, td.x.t a, td.x.t ol, td.x.t ul, td.x.t div, td.x.t { font-size:14px!important }
td.x.sm span, td.x.sm p, td.x.sm a, td.x.sm ol, td.x.sm ul, td.x.sm div, td.x.sm { line-height:18px!important }
td.x.n span, td.x.n p, td.x.n a, td.x.n ol, td.x.n ul, td.x.n div, td.x.n { line-height:22px!important }
td.x.vp span, td.x.vp p, td.x.vp a, td.x.vp ol, td.x.vp ul, td.x.vp div, td.x.vp { font-size:16px!important }
td.x.lf span, td.x.lf p, td.x.lf a, td.x.lf ol, td.x.lf ul, td.x.lf div, td.x.lf { line-height:20px!important }
div.w.ey > table > tbody > tr > td, div.w.ey > div > table > tbody > tr > td { padding-right:16px!important; }
div.w.y > table > tbody > tr > td, div.w.y > div > table > tbody > tr > td { padding-left:16px!important; }
td.x.ey { padding-right:16px!important; }
td.x.y { padding-left:16px!important; }
td.b.xb > table { width:100%!important } td.xb > table > tbody > tr > td > a { display: block!important; width: 100%!important; padding-left: 0!important; padding-right: 0!important; }
td.b.xb > table { width:100%!important } td.xb > table > tbody > tr > td { width: 100%!important; padding-left: 0!important; padding-right: 0!important; }
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
<!--[if mso]>
<style>
.co { background: transparent !important; background-color: transparent !important; mso-padding-alt: 0px !important; padding: 0px !important; border: 0px !important; border-top: 0px !important; border-right: 0px !important; border-bottom: 0px !important; border-left: 0px !important; }
</style>
<![endif]-->
</head>
<body lang="en" link="#a94a34" vlink="#a94a34" class="emailify" style="mso-line-height-rule: exactly; mso-hyphenate: none; word-wrap: normal; word-spacing: normal; background-color: #1e1e1e;">
<style data-emailify-desktop-column-width-fallback type="text/css">
@media only screen and (min-width:600px) {
.p { width:568px !important; max-width: 568px; }
.c { width:600px !important; max-width: 600px; }
.o { width:486px !important; max-width: 486px; }
.k { width:536px !important; max-width: 536px; }
.ok { width:100% !important; max-width: 100%; }
.d { width:48.4496% !important; max-width: 48.4496%; }
.ks { width:3.1008% !important; max-width: 3.1008%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
.e { width:440px !important; max-width: 440px; }
}
</style>
<div style="background-color:#1e1e1e;" lang="en" dir="auto">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#a94a34;background-color:#a94a34;margin:0px auto;max-width:600px;">
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
<img alt src="https://e.hypermatic.com/f854eb869b5cb1a100c4794e37a7d354.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="238">
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
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:600px;" class="mq">
<img alt src="https://e.hypermatic.com/31c49f0b8ddcf67843a1527607cc19ca.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:600px;" class="mq">
<img alt src="https://e.hypermatic.com/e37ebaf8a5cd99a1a314dde3adb78fc4.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:5px 57px 7px 57px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:486px;"><![endif]-->
<div class="o h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t sm" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:400;line-height:131%;text-align:center;color:#231e1a;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">Estamos emocionados de recibirte en esta edici&oacute;n especial <span style="font-weight:800;color:#a94a34;">ENTRE SOLES</span></p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:500;line-height:150%;text-align:center;text-transform:uppercase;color:#5d5d5d;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Lugar: </span>Casa Candela</p><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">FECHA: </span>18 DE OCTUBRE <span style="font-weight:800;"> </span><span style="font-size:10px;mso-line-height-alt:15px;">|</span><span style="font-size:10px;font-weight:800;mso-line-height-alt:15px;"> </span><span style="font-weight:800;"> HORA: </span>10 a.m.</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;line-height:100%;text-align:center;text-transform:uppercase;color:#a94a34;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">
C&oacute;digo de vestimenta</p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">&nbsp;<br class="s"><span style="font-weight:500;">Boho Essentials
</span></p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;"><span style="font-weight:500;">&nbsp;</span></p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 42px 16px 42px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:516px;"><![endif]-->
<div class="ok h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
<!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:top;width:249px;"><![endif]-->
<div class="d h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:48.4496%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:top;" width="100%">
<tbody>
<tr>
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:249px;" class="mq">
<img alt src="https://e.hypermatic.com/81088532b9047d4602cde9f2258e56f6.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="249">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:16px;"><![endif]-->
<div class="ks h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:3.1008%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:249px;"><![endif]-->
<div class="d h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:48.4496%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:top;" width="100%">
<tbody>
<tr>
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:249px;" class="mq">
<img alt src="https://e.hypermatic.com/d89b6f35ab276adab6556d5fab4fc28d.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="249">
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
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 32px 8px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x vp lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:700;letter-spacing:1px;line-height:100%;text-align:center;text-transform:uppercase;color:#231e1a;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">
&iquest;C&oacute;mo llegar?
</p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">&nbsp;</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600" bgcolor="#eae0ce"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="w ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 16px 16px 16px;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;border-radius:4px 4px 4px 4px;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 20px 16px 33px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:515px;"><![endif]-->
<div class="ok h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
<!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:middle;width:52px;"><![endif]-->
<div class="m h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:10.0971%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="right" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:52px;">
<img alt src="https://e.hypermatic.com/39e8cce8e6f9b39bc33676d4040d20a6.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="52">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:21px;"><![endif]-->
<div class="u h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:4.2718%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:middle;width:424px;"><![endif]-->
<div class="l h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:82.3301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="left" class="x t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#5d5d5d;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;">Usa Waze para llegar a Casa Candela, </span>Sopetr&aacute;n (V&iacute;a Antigua) / RN62-04B, Sopetr&aacute;n:<span style="color:#777777;"> </span><a href="https://waze.com/ul/hd34hu7f57" style="color:#a94a34;text-decoration:none;" target="_blank"><span style="color:#a94a34;text-decoration:underline;">https://waze.com/ul/hd34hu7f57</span></a><span style="color:#a94a34;"> </span></p></div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:17px;"><![endif]-->
<div class="j h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:3.301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table></td></tr><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div style="margin:0px auto;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
<tbody>
<tr>
<td style="direction:ltr;font-size:0;padding:0;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:top;width:568px;"><![endif]-->
<div class="ok h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="font-size:0;padding:0;word-break:break-word;" aria-hidden="true">
<div style="height:8px;line-height:8px;">&#8202;</div>
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
<!--[if mso | IE]></td></tr></table></td></tr><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;border-radius:4px 4px 4px 4px;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 20px 16px 33px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:515px;"><![endif]-->
<div class="ok h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
<!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:middle;width:52px;"><![endif]-->
<div class="m h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:10.0971%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="right" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:52px;">
<img alt src="https://e.hypermatic.com/ec19dc9b8d3e8d0b2bd24789f89fb20d.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="52">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:21px;"><![endif]-->
<div class="u h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:4.2718%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:middle;width:424px;"><![endif]-->
<div class="l h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:82.3301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="left" class="x t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#a94a34;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;color:#5d5d5d;">O coloca la ubicaci&oacute;n en Google Maps:</span><span style="font-weight:400;color:#777777;"> </span><a href="https://maps.app.goo.gl/MkCT7YPhmAaUEoZh6" style="color:#a94a34;text-decoration:none;" target="_blank"><span style="text-decoration:underline;">https://maps.app.goo.gl/SvtnDvXWkvTERhk99</span></a></p></div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:17px;"><![endif]-->
<div class="j h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:3.301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:15px 80px 14px 80px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:440px;"><![endif]-->
<div class="e h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x ey y t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:131%;text-align:center;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">Recuerda llevar tu c&oacute;digo QR para agilizar tu ingreso. <span style="font-weight:400;">Nos vemos ma&ntilde;ana para disfrutar de una experiencia de </span>m&uacute;sica y lifestyle.</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:20px 16px 34px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="b xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:364px;line-height:100%;">
<tbody>
<tr>
<td align="center" bgcolor="#a94a34" class="co" role="presentation" style="background:#a94a34;border:none;border-radius:60px 60px 60px 60px;cursor:auto;mso-padding-alt:12px 0px 12px 0px;vertical-align:middle;" valign="middle">
<!--[if mso]><v:roundrect style="width:271.5pt;height:30.75pt;v-text-anchor:middle;" arcsize="100%" fill="t" stroke="f" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"><w:anchorlock/><v:fill type="solid" color="#a94a34" /><v:textbox inset="0,0,0,0"><center><![endif]-->
<a href="https://wa.link/s64zsh" class="co" style="display:inline-block;width:364px;background-color:#a94a34;color:#ffffff;font-family:'Inter', 'Arial', sans-serif;font-size:13px;font-weight:normal;line-height:100%;margin:0;text-decoration:none;text-transform:none;padding:12px 0px 12px 0px;mso-padding-alt:0;border-radius:60px 60px 60px 60px;" target="_blank">
<span style="font-size:14px;font-family:'Inter', 'Arial', sans-serif;font-weight:700;text-transform:uppercase;color:#eae0ce;line-height:121%;mso-line-height-alt:17px;">Escr&iacute;benos y te brindaremos asistencia</span>
</a>
<!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#1e1e1e;background-color:#1e1e1e;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#1e1e1e;background-color:#1e1e1e;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 16px 16px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x" style="font-size:0;padding-bottom:16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:13px;font-weight:400;letter-spacing:19px;line-height:115%;text-align:center;color:#4d4d4d;"><p style="Margin:0;mso-line-height-alt:15px;font-size:13px;line-height:115%;">CASA CANDELA</p></div>
</td>
</tr>
<tr>
<td align="center" class="x" style="font-size:0;padding-bottom:16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:14px;font-weight:400;line-height:157%;text-align:center;color:#d9d1c0;"><p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:157%;">Tafetanes, Route 429180 Old Road to Sopetr&aacute;n, Antioquia</p><p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:183%;"><span style="font-size:12px;font-weight:700;line-height:183%;letter-spacing:2px;text-transform:uppercase;">www.casacandela.co</span></p></div>
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
<img alt="X" height="24" src="https://e.hypermatic.com/45e79b24e2181becd378fe3ec69a8cce.png" style="display:block;" width="24">
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
</html>
`;

// ==========================================
// 2. CÓDIGO HTML EN INGLÉS (EMAILIFY FIGMA)
// ==========================================
const EMAIL_HTML_EN = `
<!doctype html>
<html lang="en" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<title></title>
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
.o { width:486px !important; max-width: 486px; }
.k { width:536px !important; max-width: 536px; }
.ok { width:100% !important; max-width: 100%; }
.d { width:48.4496% !important; max-width: 48.4496%; }
.ks { width:3.1008% !important; max-width: 3.1008%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
.e { width:440px !important; max-width: 440px; }
}
</style>
<style media="screen and (min-width:600px)">
.moz-text-html .p { width:568px !important; max-width: 568px; }
.moz-text-html .c { width:600px !important; max-width: 600px; }
.moz-text-html .o { width:486px !important; max-width: 486px; }
.moz-text-html .k { width:536px !important; max-width: 536px; }
.moz-text-html .ok { width:100% !important; max-width: 100%; }
.moz-text-html .d { width:48.4496% !important; max-width: 48.4496%; }
.moz-text-html .ks { width:3.1008% !important; max-width: 3.1008%; }
.moz-text-html .m { width:10.0971% !important; max-width: 10.0971%; }
.moz-text-html .u { width:4.2718% !important; max-width: 4.2718%; }
.moz-text-html .l { width:82.3301% !important; max-width: 82.3301%; }
.moz-text-html .j { width:3.301% !important; max-width: 3.301%; }
.moz-text-html .e { width:440px !important; max-width: 440px; }
</style>
<style type="text/css">

@media only screen and (max-width:599px) {
table.mq { width: 100% !important; }
td.mq { width: auto !important; }
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
}div.wa { font-size: 0; }
@media only screen and (max-width:599px) {
.emailify { height:100% !important; margin:0 !important; padding:0 !important; width:100% !important; }
.mq img { width: 100%!important; max-width: 100%!important; height: auto!important; }
br.s { display: none!important; }
td.b td { background-size: cover!important; }
div.r > table > tbody > tr > td { direction: ltr!important; }
img { background-color: transparent!important; }
div.r.ey > table > tbody > tr > td, div.r.ey > div > table > tbody > tr > td { padding-right:16px!important }
div.r.y > table > tbody > tr > td, div.r.y > div > table > tbody > tr > td { padding-left:16px!important }
div.r.pt-0 > table > tbody > tr > td, div.r.pt-0 > div > table > tbody > tr > td { padding-top:0px!important }
div.r.pr-0 > table > tbody > tr > td, div.r.pr-0 > div > table > tbody > tr > td { padding-right:0px!important }
div.r.pb-0 > table > tbody > tr > td, div.r.pb-0 > div > table > tbody > tr > td { padding-bottom:0px!important }
div.r.pl-0 > table > tbody > tr > td, div.r.pl-0 > div > table > tbody > tr > td { padding-left:0px!important }
td.x.t span, td.x.t p, td.x.t a, td.x.t ol, td.x.t ul, td.x.t div, td.x.t { font-size:14px!important }
td.x.sm span, td.x.sm p, td.x.sm a, td.x.sm ol, td.x.sm ul, td.x.sm div, td.x.sm { line-height:18px!important }
td.x.n span, td.x.n p, td.x.n a, td.x.n ol, td.x.n ul, td.x.n div, td.x.n { line-height:22px!important }
td.x.vp span, td.x.vp p, td.x.vp a, td.x.vp ol, td.x.vp ul, td.x.vp div, td.x.vp { font-size:16px!important }
td.x.lf span, td.x.lf p, td.x.lf a, td.x.lf ol, td.x.lf ul, td.x.lf div, td.x.lf { line-height:20px!important }
div.w.ey > table > tbody > tr > td, div.w.ey > div > table > tbody > tr > td { padding-right:16px!important; }
div.w.y > table > tbody > tr > td, div.w.y > div > table > tbody > tr > td { padding-left:16px!important; }
td.x.ey { padding-right:16px!important; }
td.x.y { padding-left:16px!important; }
td.b.xb > table { width:100%!important } td.xb > table > tbody > tr > td > a { display: block!important; width: 100%!important; padding-left: 0!important; padding-right: 0!important; }
td.b.xb > table { width:100%!important } td.xb > table > tbody > tr > td { width: 100%!important; padding-left: 0!important; padding-right: 0!important; }
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
<!--[if mso]>
<style>
.co { background: transparent !important; background-color: transparent !important; mso-padding-alt: 0px !important; padding: 0px !important; border: 0px !important; border-top: 0px !important; border-right: 0px !important; border-bottom: 0px !important; border-left: 0px !important; }
</style>
<![endif]-->
</head>
<body lang="en" link="#a94a34" vlink="#a94a34" class="emailify" style="mso-line-height-rule: exactly; mso-hyphenate: none; word-wrap: normal; word-spacing: normal; background-color: #1e1e1e;">
<style data-emailify-desktop-column-width-fallback type="text/css">
@media only screen and (min-width:600px) {
.p { width:568px !important; max-width: 568px; }
.c { width:600px !important; max-width: 600px; }
.o { width:486px !important; max-width: 486px; }
.k { width:536px !important; max-width: 536px; }
.ok { width:100% !important; max-width: 100%; }
.d { width:48.4496% !important; max-width: 48.4496%; }
.ks { width:3.1008% !important; max-width: 3.1008%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
.e { width:440px !important; max-width: 440px; }
}
</style>
<div style="background-color:#1e1e1e;" lang="en" dir="auto">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#a94a34;background-color:#a94a34;margin:0px auto;max-width:600px;">
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
<img alt src="https://e.hypermatic.com/f854eb869b5cb1a100c4794e37a7d354.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="238">
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
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:600px;" class="mq">
<img alt src="https://e.hypermatic.com/31c49f0b8ddcf67843a1527607cc19ca.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:600px;" class="mq">
<img alt src="https://e.hypermatic.com/e37ebaf8a5cd99a1a314dde3adb78fc4.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:5px 57px 7px 57px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:486px;"><![endif]-->
<div class="o h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t sm" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:400;line-height:131%;text-align:center;color:#231e1a;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">We're excited to welcome you to this special</p><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;"><span style="font-weight:800;color:#a94a34;">ENTRE SOLES</span></p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:500;line-height:150%;text-align:center;text-transform:uppercase;color:#5d5d5d;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Location: </span>Casa Candela</p><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Date: </span>october 18th <span style="font-weight:800;"> </span><span style="font-size:10px;mso-line-height-alt:15px;">|</span><span style="font-size:10px;font-weight:800;mso-line-height-alt:15px;"> </span><span style="font-weight:800;"> Time: </span>10 a.m.</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:500;letter-spacing:2px;line-height:100%;text-align:center;text-transform:uppercase;color:#a94a34;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;"><span style="font-weight:700;">
Dress code</span></p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;"><span style="font-weight:700;">&nbsp;<br class="s"></span>Boho Essentials
</p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">&nbsp;</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 42px 16px 42px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:516px;"><![endif]-->
<div class="ok h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
<!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:top;width:249px;"><![endif]-->
<div class="d h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:48.4496%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:top;" width="100%">
<tbody>
<tr>
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:249px;" class="mq">
<img alt src="https://e.hypermatic.com/81088532b9047d4602cde9f2258e56f6.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="249">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:16px;"><![endif]-->
<div class="ks h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:3.1008%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:249px;"><![endif]-->
<div class="d h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:48.4496%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:top;" width="100%">
<tbody>
<tr>
<td align="center" class="xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:249px;" class="mq">
<img alt src="https://e.hypermatic.com/d89b6f35ab276adab6556d5fab4fc28d.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="249">
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
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 32px 8px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x vp lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:700;letter-spacing:1px;line-height:100%;text-align:center;text-transform:uppercase;color:#231e1a;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">
How to get there
</p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">&nbsp;</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600" bgcolor="#eae0ce"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="w ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 16px 16px 16px;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;border-radius:4px 4px 4px 4px;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 20px 16px 33px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:515px;"><![endif]-->
<div class="ok h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
<!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:middle;width:52px;"><![endif]-->
<div class="m h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:10.0971%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="right" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:52px;">
<img alt src="https://e.hypermatic.com/39e8cce8e6f9b39bc33676d4040d20a6.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="52">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:21px;"><![endif]-->
<div class="u h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:4.2718%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:middle;width:424px;"><![endif]-->
<div class="l h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:82.3301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="left" class="x t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#5d5d5d;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;">Use Waze to get to Casa Candela, </span>San Jer&oacute;nimo-Sopetr&aacute;n (V&iacute;a Antigua) / RN62-04B, Sopetr&aacute;n:<span style="color:#777777;"> </span><a href="https://waze.com/ul/hd34hu7f57" style="color:#a94a34;text-decoration:none;" target="_blank"><span style="color:#a94a34;text-decoration:underline;">https://waze.com/ul/hd34hu7f57</span></a><span style="color:#a94a34;"> </span></p></div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:17px;"><![endif]-->
<div class="j h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:3.301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table></td></tr><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div style="margin:0px auto;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
<tbody>
<tr>
<td style="direction:ltr;font-size:0;padding:0;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:top;width:568px;"><![endif]-->
<div class="ok h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="font-size:0;padding:0;word-break:break-word;" aria-hidden="true">
<div style="height:8px;line-height:8px;">&#8202;</div>
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
<!--[if mso | IE]></td></tr></table></td></tr><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;border-radius:4px 4px 4px 4px;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 20px 16px 33px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:515px;"><![endif]-->
<div class="ok h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
<!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:middle;width:52px;"><![endif]-->
<div class="m h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:10.0971%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="right" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:52px;">
<img alt src="https://e.hypermatic.com/ec19dc9b8d3e8d0b2bd24789f89fb20d.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="52">
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:21px;"><![endif]-->
<div class="u h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:4.2718%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:middle;width:424px;"><![endif]-->
<div class="l h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:82.3301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="left" class="x t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#a94a34;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;color:#5d5d5d;">Or enter the location on Google Maps:</span><span style="font-weight:400;color:#777777;"> </span><a href="https://maps.app.goo.gl/MkCT7YPhmAaUEoZh6" style="color:#a94a34;text-decoration:none;" target="_blank"><span style="text-decoration:underline;">https://maps.app.goo.gl/SvtnDvXWkvTERhk99</span></a></p></div>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td><td style="vertical-align:top;width:17px;"><![endif]-->
<div class="j h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:3.301%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
<tr>
<td style="vertical-align:top;padding:0;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tbody>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</div>
<!--[if mso | IE]></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table></td></tr></table><![endif]-->
</td>
</tr>
</tbody>
</table>
</div>
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:15px 80px 14px 80px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:440px;"><![endif]-->
<div class="e h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x ey y t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:131%;text-align:center;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">Don't forget to bring your QR code to speed up your entry. <span style="font-weight:400;">See you tomorrow for an experience full of </span>fashion, music, and lifestyle</p></div>
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#eae0ce;background-color:#eae0ce;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#eae0ce;background-color:#eae0ce;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:20px 16px 34px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="b xb" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:360px;line-height:100%;">
<tbody>
<tr>
<td align="center" bgcolor="#a94a34" class="co" role="presentation" style="background:#a94a34;border:none;border-radius:60px 60px 60px 60px;cursor:auto;mso-padding-alt:12px 0px 12px 0px;vertical-align:middle;" valign="middle">
<!--[if mso]><v:roundrect style="width:268.5pt;height:30.75pt;v-text-anchor:middle;" arcsize="100%" fill="t" stroke="f" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"><w:anchorlock/><v:fill type="solid" color="#a94a34" /><v:textbox inset="0,0,0,0"><center><![endif]-->
<a href="https://wa.link/s64zsh" class="co" style="display:inline-block;width:360px;background-color:#a94a34;color:#ffffff;font-family:'Inter', 'Arial', sans-serif;font-size:13px;font-weight:normal;line-height:100%;margin:0;text-decoration:none;text-transform:none;padding:12px 0px 12px 0px;mso-padding-alt:0;border-radius:60px 60px 60px 60px;" target="_blank">
<span style="font-size:14px;font-family:'Inter', 'Arial', sans-serif;font-weight:700;text-transform:uppercase;color:#eae0ce;line-height:121%;mso-line-height-alt:17px;">Message us, and we'll be glad to assist</span>
</a>
<!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#1e1e1e;background-color:#1e1e1e;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#1e1e1e;background-color:#1e1e1e;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 16px 16px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x" style="font-size:0;padding-bottom:16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:13px;font-weight:400;letter-spacing:19px;line-height:115%;text-align:center;color:#4d4d4d;"><p style="Margin:0;mso-line-height-alt:15px;font-size:13px;line-height:115%;">CASA CANDELA</p></div>
</td>
</tr>
<tr>
<td align="center" class="x" style="font-size:0;padding-bottom:16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:14px;font-weight:400;line-height:157%;text-align:center;color:#d9d1c0;"><p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:157%;">Tafetanes, Route 429180 Old Road to Sopetr&aacute;n, Antioquia</p><p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:183%;"><span style="font-size:12px;font-weight:700;line-height:183%;letter-spacing:2px;text-transform:uppercase;">www.casacandela.co</span></p></div>
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
<img alt="X" height="24" src="https://e.hypermatic.com/45e79b24e2181becd378fe3ec69a8cce.png" style="display:block;" width="24">
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
</html>
`;

// ==========================================
// 3. CONFIGURACIÓN DE ENVÍO
// ==========================================
// Hora programada: 17 de Octubre de 2026, 10:00 AM (Hora Colombia: UTC-5 -> 15:00 UTC)
const TARGET_DATE_STRING = '2026-10-17T10:00:00-05:00';

// Asuntos del correo por idioma
const SUBJECT_ES = '✨ ¡Boho Sunday Entre Soles es mañana!';
const SUBJECT_EN = '✨ Boho Sunday Entre Soles is tomorrow!';

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
        message: `Aún no es la hora programada. Faltan ${secondsLeft} segundos para el envío (17 de Octubre, 10:00 AM Colombia).`,
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
    const activeSlug = activeEdition?.slug || 'entre-soles';
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
