import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from '@/lib/emailService';

// ==========================================
// 1. VARIABLE PARA TU CÓDIGO HTML (EMAILIFY FIGMA)
// Copia y pega tu código HTML exportado dentro de las comillas invertidas (backticks) abajo.
// ==========================================
const EMAIL_HTML = `
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
<link href="https://fonts.googleapis.com/css?family=Inter:400,700,800,500" rel="stylesheet" type="text/css">
<!--<![endif]-->
<style type="text/css">

@media only screen and (min-width:599px) {
.p { width:568px !important; max-width: 568px; }
.c { width:600px !important; max-width: 600px; }
.g { width:460px !important; max-width: 460px; }
.k { width:536px !important; max-width: 536px; }
.o { width:100% !important; max-width: 100%; }
.d { width:48.4496% !important; max-width: 48.4496%; }
.ks { width:3.1008% !important; max-width: 3.1008%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
.e { width:440px !important; max-width: 440px; }
}
</style>
<style media="screen and (min-width:599px)">
.moz-text-html .p { width:568px !important; max-width: 568px; }
.moz-text-html .c { width:600px !important; max-width: 600px; }
.moz-text-html .g { width:460px !important; max-width: 460px; }
.moz-text-html .k { width:536px !important; max-width: 536px; }
.moz-text-html .o { width:100% !important; max-width: 100%; }
.moz-text-html .d { width:48.4496% !important; max-width: 48.4496%; }
.moz-text-html .ks { width:3.1008% !important; max-width: 3.1008%; }
.moz-text-html .m { width:10.0971% !important; max-width: 10.0971%; }
.moz-text-html .u { width:4.2718% !important; max-width: 4.2718%; }
.moz-text-html .l { width:82.3301% !important; max-width: 82.3301%; }
.moz-text-html .j { width:3.301% !important; max-width: 3.301%; }
.moz-text-html .e { width:440px !important; max-width: 440px; }
</style>
<style type="text/css">

@media only screen and (max-width:598px) {
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
.gu { display: block!important; height: auto!important; overflow: visible!important; }
.p3 { display: none!important; max-width: 0!important; max-height: 0!important; overflow: hidden!important; mso-hide: all!important; }
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
td.x.lf span, td.x.lf p, td.x.lf a, td.x.lf ol, td.x.lf ul, td.x.lf div, td.x.lf { line-height:20px!important }
td.x.vp span, td.x.vp p, td.x.vp a, td.x.vp ol, td.x.vp ul, td.x.vp div, td.x.vp { font-size:16px!important }
div.w.ey > table > tbody > tr > td, div.w.ey > div > table > tbody > tr > td { padding-right:16px!important; }
div.w.y > table > tbody > tr > td, div.w.y > div > table > tbody > tr > td { padding-left:16px!important; }
td.x.ey { padding-right:16px!important; }
td.x.y { padding-left:16px!important; }
td.b.t a, td.b.t span { font-size:14px!important }
td.b.v92 > table > tbody > tr > td { border-radius:8px!important }
td.b.xb > table { width:100%!important } td.xb > table > tbody > tr > td > a { display: block!important; width: 100%!important; padding-left: 0!important; padding-right: 0!important; }
td.b.xb > table { width:100%!important } td.xb > table > tbody > tr > td { width: 100%!important; padding-left: 0!important; padding-right: 0!important; }
}@media screen yahoo {
.gu { mso-hide: all!important; display: none!important; height: 0!important; overflow: hidden!important; }
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
<!--[if mso]><!-- -->
<style>
.sq > table > tbody > tr > td { border-collapse: collapse; }
</style>
<!--<![endif]-->
</head>
<body lang="en" link="#676a52" vlink="#676a52" class="emailify" style="mso-line-height-rule: exactly; mso-hyphenate: none; word-wrap: normal; word-spacing: normal; background-color: #1e1e1e;">
<div style="background-color:#1e1e1e;" lang="en" dir="auto">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#676a52;background-color:#676a52;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#676a52;background-color:#676a52;width:100%;">
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
<div class="r pt-0 pr-0 pb-0 pl-0 p3" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
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
<img alt src="https://e.hypermatic.com/a68e0b8272b32c4834f77b1082e4b06f.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<div class="r pt-0 pr-0 pb-0 pl-0 gu" style="mso-hide: all; display: none; height: 0; overflow: hidden; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; background: #fffffe; background-color: #fffffe; margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: #fffffe; background-color: #fffffe; width: 100%;" width="100%" bgcolor="#fffffe">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; border: none; direction: ltr; font-size: 0px; padding: 0; text-align: left;" align="left">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="mso-hide: all; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: transparent; border: none; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td align="center" class="xb" style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; font-size: 0px; padding: 0; word-break: break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; border-collapse: collapse; border-spacing: 0px;" class="mq">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; width: 600px;" class="mq" width="600">
<img alt src="https://e.hypermatic.com/06a1a2650e5eb7ff0d3b29f78437e48e.jpg" style="mso-hide: all; border: 0; display: block; outline: none; text-decoration: none; height: auto; width: 100%; font-size: 13px;" width="600">
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
<div class="r pt-0 pr-0 pb-0 pl-0 p3" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
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
<img alt src="https://e.hypermatic.com/b0865adec8b58eb216859f2ef39246c6.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<div class="r pt-0 pr-0 pb-0 pl-0 gu" style="mso-hide: all; display: none; height: 0; overflow: hidden; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; background: #fffffe; background-color: #fffffe; margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: #fffffe; background-color: #fffffe; width: 100%;" width="100%" bgcolor="#fffffe">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; border: none; direction: ltr; font-size: 0px; padding: 0; text-align: left;" align="left">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="mso-hide: all; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: transparent; border: none; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td align="center" class="xb" style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; font-size: 0px; padding: 0; word-break: break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; border-collapse: collapse; border-spacing: 0px;" class="mq">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; width: 600px;" class="mq" width="600">
<img alt src="https://e.hypermatic.com/0fdf155f2b36aa1966321d34a276f17b.jpg" style="mso-hide: all; border: 0; display: block; outline: none; text-decoration: none; height: auto; width: 100%; font-size: 13px;" width="600">
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:20px 16px 5px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:102px;">
<img alt src="https://e.hypermatic.com/7c9cc78768171272c7b6804b88647d17.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="102">
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:11px 70px 10px 70px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:460px;"><![endif]-->
<div class="g h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:400;line-height:138%;text-align:center;text-transform:uppercase;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:22px;font-size:16px;line-height:138%;"><span style="text-transform:none;">Estamos emocionados de recibirte en esta edici&oacute;n especial </span><span style="font-weight:700;">Colombiamoda Edition.</span></p><p style="Margin:0;mso-line-height-alt:22px;font-size:16px;line-height:138%;"><span style="text-transform:none;">&nbsp;</span></p><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;color:#676a52;line-height:150%;mso-line-height-alt:24px;">Lugar:</span><span style="font-weight:700;color:#676a52;line-height:150%;mso-line-height-alt:24px;"> </span><span style="font-weight:500;color:#676a52;line-height:150%;mso-line-height-alt:24px;">Casa Candela</span></p><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;color:#676a52;line-height:150%;mso-line-height-alt:24px;">Fecha:</span><span style="font-weight:700;color:#676a52;line-height:150%;mso-line-height-alt:24px;"> </span><span style="font-weight:500;color:#676a52;line-height:150%;mso-line-height-alt:24px;">26 de julio | </span><span style="font-weight:800;color:#676a52;line-height:150%;mso-line-height-alt:24px;">Hora:</span><span style="font-weight:500;color:#676a52;line-height:150%;mso-line-height-alt:24px;"> 10 a.m.</span></p></div>
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:8px 16px 3px 16px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:568px;"><![endif]-->
<div class="p h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;">
<tbody>
<tr>
<td style="width:114px;">
<img alt src="https://e.hypermatic.com/744c44bf7f8b2d3be55464274b915d88.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="114">
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 32px 8px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x vp lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;line-height:100%;text-align:center;text-transform:uppercase;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">
C&oacute;digo de vestimenta</p><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">&nbsp;<br class="s"><span style="font-weight:500;">Fashion chic
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 42px 16px 42px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:516px;"><![endif]-->
<div class="o h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
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
<img alt src="https://e.hypermatic.com/e858e8cd8bacb6ffe41ae2a847339779.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="249">
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
<img alt src="https://e.hypermatic.com/fc21c7c80ea601bc3fb887483f1ee93f.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="249">
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 32px 8px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x vp lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:700;letter-spacing:1px;line-height:100%;text-align:center;text-transform:uppercase;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">
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
<!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600" bgcolor="#d9d1c0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="w ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 16px 16px 16px;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;border-radius:4px 4px 4px 4px;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 20px 16px 33px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:515px;"><![endif]-->
<div class="o h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
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
<img alt src="https://e.hypermatic.com/c974286099784b7f7aa8066deef20c1b.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="52">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#777777;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;">Usa Waze para llegar a Casa Candela, </span>Sopetr&aacute;n (V&iacute;a Antigua) / RN62-04B, Sopetr&aacute;n: <a href="https://waze.com/ul/hd34hu7f57" style="color:#676a52;text-decoration:none;" target="_blank"><span style="color:#676a52;text-decoration:underline;">https://waze.com/ul/hd34hu7f57</span></a><span style="color:#676a52;"> </span></p></div>
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
<div class="o h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;border-radius:4px 4px 4px 4px;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 20px 16px 33px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="width:515px;"><![endif]-->
<div class="o h wa" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
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
<img alt src="https://e.hypermatic.com/dff129847c98c5c1d32989bac2f73091.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="52">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#676a52;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;color:#777777;">O coloca la ubicaci&oacute;n en Google Maps: </span><a href="https://maps.app.goo.gl/SvtnDvXWkvTERhk99" style="color:#676a52;text-decoration:none;" target="_blank"><span style="text-decoration:underline;">https://maps.app.goo.gl/SvtnDvXWkvTERhk99</span></a></p></div>
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:15px 80px 14px 80px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:440px;"><![endif]-->
<div class="e h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x ey y t lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:131%;text-align:center;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">Recuerda llevar tu c&oacute;digo QR para agilizar tu ingreso. <span style="font-weight:400;">Nos vemos ma&ntilde;ana para disfrutar de una experiencia de </span>moda, m&uacute;sica y lifestyle.</p></div>
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
<div class="r ey y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:15px 70px 44px 70px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:460px;"><![endif]-->
<div class="g h sq" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0px; background: transparent; border: none; border-radius: 8px 8px 8px 8px; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody>
<tr>
<td align="center" class="b t v92 xb" style="border-collapse: separate; border-spacing: 0px; font-size: 0px; padding: 0; word-break: break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:460px;line-height:100%;">
<tbody>
<tr>
<td align="center" bgcolor="#676a52" class="co" role="presentation" style="background:#676a52;border:none;border-radius:8px 8px 8px 8px;cursor:auto;mso-padding-alt:12px 0px 12px 0px;vertical-align:middle;" valign="middle">
<!--[if mso]><v:roundrect style="width:458px;height:43px;v-text-anchor:middle;" arcsize="37%" fill="t" stroke="f" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"><w:anchorlock/><v:fill type="solid" color="#676a52" /><v:textbox inset="0,0,0,0"><center><![endif]-->
<a href="#insertUrlLink" class="co" style="display:inline-block;width:460px;background-color:#676a52;color:#ffffff;font-family:'Inter', 'Arial', sans-serif;font-size:13px;font-weight:normal;line-height:100%;margin:0;text-decoration:none;text-transform:none;padding:12px 0px 12px 0px;mso-padding-alt:0;border-radius:8px 8px 8px 8px;" target="_blank">
<span style="font-size:16px;font-family:'Inter', 'Arial', sans-serif;font-weight:700;text-transform:uppercase;color:#d9d1c0;line-height:119%;mso-line-height-alt:19px;">Escr&iacute;benos y te brindaremos asistencia</span>
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
<div class="r ey y" style="background:white;background-color:#1e1e1e;margin:0px auto;max-width:600px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:14px;font-weight:400;line-height:157%;text-align:center;color:#d9d1c0;"><p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:157%;">Ruta 429180 - Vereda Tafetanes entre San Jer&oacute;nimo y Sopetr&aacute;n</p><p style="Margin:0;mso-line-height-alt:22px;font-size:14px;line-height:183%;"><span style="font-size:12px;font-weight:700;line-height:183%;letter-spacing:2px;text-transform:uppercase;">www.casacandela.co</span></p></div>
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
<a href="#insertUrlLink" target="_blank">
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
// 2. CONFIGURACIÓN DE ENVÍO
// ==========================================
// Hora programada: 25 de Junio de 2026, 9:50 AM (Hora Colombia: UTC-5)
const TARGET_DATE_STRING = '2026-06-25T09:50:00-05:00';

// Lista de destinatarios
const RECIPIENTS = [
  'alejandra@idealteamcolombia.com'
  // Puedes agregar más correos aquí separados por comas, ej: 'correo2@ejemplo.com'
];

// Asunto del correo
const EMAIL_SUBJECT = 'Boho Sunday - Correo Programado de Prueba';

// Bandera en memoria para evitar envíos duplicados en el mismo contenedor
let hasBeenSentInCurrentContainer = false;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    const now = new Date();
    const targetTime = new Date(TARGET_DATE_STRING);

    console.log(`[Scheduled Email] 🕒 Current time (UTC): ${now.toISOString()}`);
    console.log(`[Scheduled Email] 🎯 Target time (UTC): ${targetTime.toISOString()}`);

    // Verificar si ya pasó la hora programada (o si se fuerza el envío manualmente)
    const isPastTargetTime = now.getTime() >= targetTime.getTime();

    if (!isPastTargetTime && !force) {
      const secondsLeft = Math.ceil((targetTime.getTime() - now.getTime()) / 1000);
      return NextResponse.json({
        success: false,
        message: `Aún no es la hora programada. Faltan ${secondsLeft} segundos para el envío (9:50 AM Colombia).`,
        currentTime: now.toISOString(),
        targetTime: targetTime.toISOString()
      }, { status: 200 });
    }

    // Evitar re-envíos duplicados si el cron sigue ejecutándose continuamente
    // NOTA: En Serverless (Vercel), si el contenedor se reinicia, esta bandera se limpia.
    // Para entornos reales de producción se debe usar una Base de Datos o Redis (KV) para persistir el estado de "enviado".
    if (hasBeenSentInCurrentContainer && !force) {
      return NextResponse.json({
        success: false,
        message: 'El correo ya fue enviado en esta sesión del contenedor y no se volverá a enviar.'
      }, { status: 200 });
    }

    console.log(`[Scheduled Email] 🚀 Initiating scheduled email send to: ${RECIPIENTS.join(', ')}`);

    const transport = createTransport();
    const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';

    // Enviar el correo a cada destinatario
    for (const recipient of RECIPIENTS) {
      await transport.sendMail({
        from: fromAddress,
        to: recipient,
        subject: EMAIL_SUBJECT,
        html: EMAIL_HTML,
      });
      console.log(`[Scheduled Email] ✅ Email successfully sent to ${recipient}`);
    }

    // Marcar como enviado en este contenedor solo si fue un envío programado real (sin forzar)
    if (!force) {
      hasBeenSentInCurrentContainer = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Correo(s) enviado(s) correctamente.',
      recipients: RECIPIENTS,
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
