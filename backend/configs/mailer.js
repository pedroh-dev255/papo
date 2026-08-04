const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail(to, subject, title, body, link = null) {
  try {
    await transporter.verify();

    const hasLink = typeof link === "string" && link.trim() !== "";

    const template = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#374151;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 30px rgba(0,0,0,.06);">

<!-- Header -->
<tr>
<td style="padding:32px;background:linear-gradient(135deg,#242424,#7B58D9);text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;font-weight:bold;">
PharmaTrack
</h1>
<p style="margin:8px 0 0;color:#dbeafe;font-size:15px;">
Gestão inteligente de medicamentos
</p>
</td>
</tr>

<!-- Conteúdo -->
<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#111827;font-size:24px;">
${title}
</h2>

<div style="font-size:16px;line-height:1.8;color:#4b5563;">
${body}
</div>

${
  hasLink
    ? `
<div style="margin:40px 0;text-align:center;">
<a href="${link}"
style="
display:inline-block;
padding:14px 30px;
background:linear-gradient(135deg,#242424,#7B58D9);
color:#fff;
text-decoration:none;
border-radius:10px;
font-weight:bold;
font-size:16px;">
Abrir Link
</a>
</div>

<p style="font-size:13px;color:#6b7280;">
Caso o botão não funcione, copie e cole o link abaixo no navegador:
</p>

<p style="word-break:break-all;font-size:13px;color:#2563eb;">
${link}
</p>
`
    : ""
}

<hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;">

<p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0;">
Este é um e-mail automático enviado pelo <strong>PharmaTrack</strong>.
Caso você não reconheça esta solicitação, ignore esta mensagem.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:25px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">

<p style="margin:0;color:#9ca3af;font-size:13px;">
© ${new Date().getFullYear()} PharmaTrack
</p>

<p style="margin-top:6px;color:#9ca3af;font-size:12px;">
Todos os direitos reservados.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"PharmaTrack - " <${process.env.MAIL_USER}>`,
      to,
      subject,
      html: template,
    });

    console.log("🟢 Email enviado:", info.messageId);

    return info;
  } catch (error) {
    console.error("🔴 Mail Error:", error);

    throw new Error(error.message);
  }
}

module.exports = {
  transporter,
  sendEmail,
};
