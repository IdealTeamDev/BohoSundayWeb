import nodemailer from 'nodemailer';
import { getDynamicTickets } from '@/lib/tickets';
import type { BuyerInfo } from '@/types/checkout';

interface SendMailParams {
  ticketId: string;
  orderId: string;
  buyerInfo: BuyerInfo;
  quantity?: number;
}

// ==========================================
// CÓDIGO HTML EN INGLÉS (EMAILIFY FIGMA)
// Copia y pega tu código HTML en inglés exportado dentro de las comillas invertidas (backticks) abajo.
// ==========================================
export const EMAIL_HTML_EN = `
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
.f { width:450px !important; max-width: 450px; }
.k { width:536px !important; max-width: 536px; }
.f5q { width:504px !important; max-width: 504px; }
.o { width:100% !important; max-width: 100%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
}
</style>
<style media="screen and (min-width:599px)">
.moz-text-html .p { width:568px !important; max-width: 568px; }
.moz-text-html .c { width:600px !important; max-width: 600px; }
.moz-text-html .f { width:450px !important; max-width: 450px; }
.moz-text-html .k { width:536px !important; max-width: 536px; }
.moz-text-html .f5q { width:504px !important; max-width: 504px; }
.moz-text-html .o { width:100% !important; max-width: 100%; }
.moz-text-html .m { width:10.0971% !important; max-width: 10.0971%; }
.moz-text-html .u { width:4.2718% !important; max-width: 4.2718%; }
.moz-text-html .l { width:82.3301% !important; max-width: 82.3301%; }
.moz-text-html .j { width:3.301% !important; max-width: 3.301%; }
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
.g { display: block!important; height: auto!important; overflow: visible!important; }
.p3 { display: none!important; max-width: 0!important; max-height: 0!important; overflow: hidden!important; mso-hide: all!important; }
div.r > table > tbody > tr > td { direction: ltr!important; }
img { background-color: transparent!important; }
div.r.e > table > tbody > tr > td, div.r.e > div > table > tbody > tr > td { padding-right:16px!important }
div.r.y > table > tbody > tr > td, div.r.y > div > table > tbody > tr > td { padding-left:16px!important }
div.r.pt-0 > table > tbody > tr > td, div.r.pt-0 > div > table > tbody > tr > td { padding-top:0px!important }
div.r.pr-0 > table > tbody > tr > td, div.r.pr-0 > div > table > tbody > tr > td { padding-right:0px!important }
div.r.pb-0 > table > tbody > tr > td, div.r.pb-0 > div > table > tbody > tr > td { padding-bottom:0px!important }
div.r.pl-0 > table > tbody > tr > td, div.r.pl-0 > div > table > tbody > tr > td { padding-left:0px!important }
td.x.t span, td.x.t p, td.x.t a, td.x.t ol, td.x.t ul, td.x.t div, td.x.t { font-size:14px!important }
td.x.s span, td.x.s p, td.x.s a, td.x.s ol, td.x.s ul, td.x.s div, td.x.s { line-height:18px!important }
td.x.n span, td.x.n p, td.x.n a, td.x.n ol, td.x.n ul, td.x.n div, td.x.n { line-height:22px!important }
div.w.e > table > tbody > tr > td, div.w.e > div > table > tbody > tr > td { padding-right:16px!important; }
div.w.y > table > tbody > tr > td, div.w.y > div > table > tbody > tr > td { padding-left:16px!important; }
td.x.vp span, td.x.vp p, td.x.vp a, td.x.vp ol, td.x.vp ul, td.x.vp div, td.x.vp { font-size:16px!important }
td.x.lf span, td.x.lf p, td.x.lf a, td.x.lf ol, td.x.lf ul, td.x.lf div, td.x.lf { line-height:20px!important }
td.x.f9 div, td.x.f9 div > p, td.x.f9 > p, td.x.f9 div > h1, td.x.f9 > h1 { text-align: center!important }
td.x.hl { padding-right:6px!important; }
td.x.bfz { padding-left:6px!important; }
}@media screen yahoo {
.g { mso-hide: all!important; display: none!important; height: 0!important; overflow: hidden!important; }
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
<body lang="en" link="#676a52" vlink="#676a52" class="emailify" style="mso-line-height-rule: exactly; mso-hyphenate: none; word-wrap: normal; word-spacing: normal; background-color: white;">
<div style="background-color:white;" lang="en" dir="auto">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#676a52;background-color:#676a52;margin:0px auto;max-width:600px;">
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
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
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
<div class="r pt-0 pr-0 pb-0 pl-0 g" style="mso-hide: all; display: none; height: 0; overflow: hidden; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; background: #fffffe; background-color: #fffffe; margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: #fffffe; background-color: #fffffe; width: 100%;" width="100%" bgcolor="#fffffe">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; border: none; direction: ltr; font-size: 0px; padding: 0; text-align: left;" align="left">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="mso-hide: all; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: transparent; border: none; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td align="center" style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; font-size: 0px; padding: 0; word-break: break-word;">
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
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:600px;" class="mq">
<img alt src="https://e.hypermatic.com/1fdc88bb5a09e8f2430b159562726eb6.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<div class="r pt-0 pr-0 pb-0 pl-0 g" style="mso-hide: all; display: none; height: 0; overflow: hidden; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; background: #fffffe; background-color: #fffffe; margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: #fffffe; background-color: #fffffe; width: 100%;" width="100%" bgcolor="#fffffe">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; border: none; direction: ltr; font-size: 0px; padding: 0; text-align: left;" align="left">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="mso-hide: all; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: transparent; border: none; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td align="center" style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; font-size: 0px; padding: 0; word-break: break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; border-collapse: collapse; border-spacing: 0px;" class="mq">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; width: 600px;" class="mq" width="600">
<img alt src="https://e.hypermatic.com/86f8872b0aa07c99a2243836df3a81d0.jpg" style="mso-hide: all; border: 0; display: block; outline: none; text-decoration: none; height: auto; width: 100%; font-size: 13px;" width="600">
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:5px 75px 7px 75px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:450px;"><![endif]-->
<div class="f h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t s" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:400;line-height:131%;text-align:center;color:#231e1a;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">Thank you for being part of this experience. <span style="font-weight:700;">Attached is your access QR code</span>, which you'll need to present on the day of the event.</p></div>
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:14px 32px 16px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t n" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:500;line-height:150%;text-align:center;text-transform:uppercase;color:#676a52;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Location: </span>Casa Candela</p><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Date: </span>July 26th <span style="font-weight:800;"> </span><span style="font-size:10px;mso-line-height-alt:15px;">|</span><span style="font-size:10px;font-weight:800;mso-line-height-alt:15px;"> </span><span style="font-weight:800;"> Time: </span>10 a.m.</p></div>
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
<div class="w e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 16px 16px 16px;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:568px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 32px 8px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:504px;"><![endif]-->
<div class="f5q h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x vp lf" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:18px;font-weight:700;letter-spacing:1px;line-height:100%;text-align:center;text-transform:uppercase;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:18px;font-size:18px;line-height:100%;">
How to get there?
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#777777;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;">Use Waze to get to Casa Candela, </span>Sopetr&aacute;n (V&iacute;a Antigua) / RN62-04B, Sopetr&aacute;n: <a href="https://waze.com/ul/hd34hu7f57" style="color:#676a52;text-decoration:none;" target="_blank"><span style="color:#676a52;text-decoration:underline;">https://waze.com/ul/hd34hu7f57</span></a><span style="color:#676a52;"> </span></p></div>
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
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
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:150%;text-align:left;color:#676a52;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:400;color:#777777;">Or enter the location in Google Maps: </span><a href="https://maps.app.goo.gl/SvtnDvXWkvTERhk99" style="color:#676a52;text-decoration:none;" target="_blank"><span style="text-decoration:underline;">https://maps.app.goo.gl/SvtnDvXWkvTERhk99</span></a></p></div>
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 75px 72px 75px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:450px;"><![endif]-->
<div class="f h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x f9 hl bfz t s" style="font-size:0;padding:0 16px 0 16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:400;line-height:131%;text-align:center;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">We recommend saving this message so you have your entry on hand. <span style="font-weight:700;">See you soon for an afternoon of fashion, music, and good energy!</span></p></div>
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
<div class="r e y" style="background:#1e1e1e;background-color:#1e1e1e;margin:0px auto;max-width:600px;">
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

/**
 * Creates the Nodemailer transport dynamically from environment variables
 */
export function createTransport() {
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
  const tickets = await getDynamicTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found in database.`);
  }

  const qrBuffer = await fetchQrBuffer(orderId, ticketId, buyerInfo.email);

  const transport = createTransport();
  const fromAddress = process.env.EMAIL_FROM || '"Boho Sunday" <reservas@bohosunday.com>';

  const isEnglish = buyerInfo.locale === 'en';

  // Compose Email HTML
  const mailHtml = isEnglish ? EMAIL_HTML_EN : `
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
<link href="https://fonts.googleapis.com/css?family=Inter:400,600,800,700,500" rel="stylesheet" type="text/css">
<!--<![endif]-->
<style type="text/css">

@media only screen and (min-width:599px) {
.p { width:568px !important; max-width: 568px; }
.c { width:600px !important; max-width: 600px; }
.f { width:450px !important; max-width: 450px; }
.k { width:536px !important; max-width: 536px; }
.o { width:100% !important; max-width: 100%; }
.m { width:10.0971% !important; max-width: 10.0971%; }
.u { width:4.2718% !important; max-width: 4.2718%; }
.l { width:82.3301% !important; max-width: 82.3301%; }
.j { width:3.301% !important; max-width: 3.301%; }
}
</style>
<style media="screen and (min-width:599px)">
.moz-text-html .p { width:568px !important; max-width: 568px; }
.moz-text-html .c { width:600px !important; max-width: 600px; }
.moz-text-html .f { width:450px !important; max-width: 450px; }
.moz-text-html .k { width:536px !important; max-width: 536px; }
.moz-text-html .o { width:100% !important; max-width: 100%; }
.moz-text-html .m { width:10.0971% !important; max-width: 10.0971%; }
.moz-text-html .u { width:4.2718% !important; max-width: 4.2718%; }
.moz-text-html .l { width:82.3301% !important; max-width: 82.3301%; }
.moz-text-html .j { width:3.301% !important; max-width: 3.301%; }
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
.g { display: block!important; height: auto!important; overflow: visible!important; }
.p3 { display: none!important; max-width: 0!important; max-height: 0!important; overflow: hidden!important; mso-hide: all!important; }
div.r > table > tbody > tr > td { direction: ltr!important; }
img { background-color: transparent!important; }
div.r.e > table > tbody > tr > td, div.r.e > div > table > tbody > tr > td { padding-right:16px!important }
div.r.y > table > tbody > tr > td, div.r.y > div > table > tbody > tr > td { padding-left:16px!important }
div.r.pt-0 > table > tbody > tr > td, div.r.pt-0 > div > table > tbody > tr > td { padding-top:0px!important }
div.r.pr-0 > table > tbody > tr > td, div.r.pr-0 > div > table > tbody > tr > td { padding-right:0px!important }
div.r.pb-0 > table > tbody > tr > td, div.r.pb-0 > div > table > tbody > tr > td { padding-bottom:0px!important }
div.r.pl-0 > table > tbody > tr > td, div.r.pl-0 > div > table > tbody > tr > td { padding-left:0px!important }
td.x.t span, td.x.t p, td.x.t a, td.x.t ol, td.x.t ul, td.x.t div, td.x.t { font-size:14px!important }
td.x.s span, td.x.s p, td.x.s a, td.x.s ol, td.x.s ul, td.x.s div, td.x.s { line-height:18px!important }
td.x.n span, td.x.n p, td.x.n a, td.x.n ol, td.x.n ul, td.x.n div, td.x.n { line-height:22px!important }
td.x.vp span, td.x.vp p, td.x.vp a, td.x.vp ol, td.x.vp ul, td.x.vp div, td.x.vp { font-size:16px!important }
td.x.lf span, td.x.lf p, td.x.lf a, td.x.lf ol, td.x.lf ul, td.x.lf div, td.x.lf { line-height:20px!important }
div.w.e > table > tbody > tr > td, div.w.e > div > table > tbody > tr > td { padding-right:16px!important; }
div.w.y > table > tbody > tr > td, div.w.y > div > table > tbody > tr > td { padding-left:16px!important; }
td.x.f9 div, td.x.f9 div > p, td.x.f9 > p, td.x.f9 div > h1, td.x.f9 > h1 { text-align: center!important }
td.x.hl { padding-right:6px!important; }
td.x.bfz { padding-left:6px!important; }
}@media screen yahoo {
.g { mso-hide: all!important; display: none!important; height: 0!important; overflow: hidden!important; }
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
<body lang="en" link="#676a52" vlink="#676a52" class="emailify" style="mso-line-height-rule: exactly; mso-hyphenate: none; word-wrap: normal; word-spacing: normal;">
<div style="background-color:white;" lang="en" dir="auto">
<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#676a52;background-color:#676a52;margin:0px auto;max-width:600px;">
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
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
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
<div class="r pt-0 pr-0 pb-0 pl-0 g" style="mso-hide: all; display: none; height: 0; overflow: hidden; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; background: #fffffe; background-color: #fffffe; margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: #fffffe; background-color: #fffffe; width: 100%;" width="100%" bgcolor="#fffffe">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; border: none; direction: ltr; font-size: 0px; padding: 0; text-align: left;" align="left">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="mso-hide: all; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: transparent; border: none; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td align="center" style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; font-size: 0px; padding: 0; word-break: break-word;">
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
<td align="center" style="font-size:0;padding:0;word-break:break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;" class="mq">
<tbody>
<tr>
<td style="width:600px;" class="mq">
<img alt src="https://e.hypermatic.com/9a8eda189f2becf5fd809902e89be1f5.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600">
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
<div class="r pt-0 pr-0 pb-0 pl-0 g" style="mso-hide: all; display: none; height: 0; overflow: hidden; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; background: #fffffe; background-color: #fffffe; margin: 0px auto; max-width: 600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: #fffffe; background-color: #fffffe; width: 100%;" width="100%" bgcolor="#fffffe">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; border: none; direction: ltr; font-size: 0px; padding: 0; text-align: left;" align="left">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:600px;"><![endif]-->
<div class="c h" style="mso-hide: all; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; background: transparent; border: none; vertical-align: middle;" width="100%" bgcolor="transparent" valign="middle">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td align="center" style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; font-size: 0px; padding: 0; word-break: break-word;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-hide: all; border-collapse: collapse; border-spacing: 0px;" class="mq">
<tbody style="mso-hide: all;">
<tr style="mso-hide: all;">
<td style="mso-hide: all; mso-padding-top-alt: 0; mso-padding-bottom-alt: 0; width: 600px;" class="mq" width="600">
<img alt src="https://e.hypermatic.com/b1c7bc34dbccdcfc37649a79fb0d8266.jpg" style="mso-hide: all; border: 0; display: block; outline: none; text-decoration: none; height: auto; width: 100%; font-size: 13px;" width="600">
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:5px 75px 7px 75px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:450px;"><![endif]-->
<div class="f h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t s" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:400;line-height:131%;text-align:center;color:#231e1a;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;">Gracias por ser parte de esta experiencia. <span style="font-weight:600;">Adjuntamos tu c&oacute;digo QR de acceso</span>, el cual deber&aacute;s presentar el d&iacute;a del evento.</p></div>
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:14px 32px 16px 32px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:536px;"><![endif]-->
<div class="k h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x t n" style="font-size:0;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:500;line-height:150%;text-align:center;text-transform:uppercase;color:#676a52;"><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Lugar:</span><span style="font-weight:700;"> </span>Casa Candela</p><p style="Margin:0;mso-line-height-alt:24px;font-size:16px;line-height:150%;"><span style="font-weight:800;">Fecha:</span><span style="font-weight:700;"> </span>26 de julio | <span style="font-weight:800;">Hora:</span> 10 a.m.</p></div>
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
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
<div class="w e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:4px 16px 16px 16px;text-align:center;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:568px;" width="568"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;border-radius:4px 4px 4px 4px;max-width:568px;">
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
<div class="r e y" style="background:#d9d1c0;background-color:#d9d1c0;margin:0px auto;max-width:600px;">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#d9d1c0;background-color:#d9d1c0;width:100%;">
<tbody>
<tr>
<td style="border:none;direction:ltr;font-size:0;padding:16px 75px 72px 75px;text-align:left;">
<!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;vertical-align:middle;width:450px;"><![endif]-->
<div class="f h" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:transparent;border:none;vertical-align:middle;" width="100%">
<tbody>
<tr>
<td align="center" class="x f9 hl bfz t s" style="font-size:0;padding:0 16px 0 16px;word-break:break-word;">
<div style="font-family:'Inter', 'Arial', sans-serif;font-size:16px;font-weight:700;line-height:131%;text-align:center;color:#1e1e1e;"><p style="Margin:0;mso-line-height-alt:21px;font-size:16px;line-height:131%;"><span style="font-weight:400;">Te recomendamos guardar este mensaje para tener tu ingreso a la mano. </span>&iexcl;Nos vemos pronto para vivir una tarde de moda, m&uacute;sica y buena energ&iacute;a!</p></div>
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
<div class="r e y" style="background:#1e1e1e;background-color:#1e1e1e;margin:0px auto;max-width:600px;">
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

  // Attachments definition (Only the QR Code as a downloadable file attachment, no CID/inline required)
  const attachments: any[] = [];

  if (qrBuffer) {
    attachments.push({
      filename: 'boho-sunday-qr.png',
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