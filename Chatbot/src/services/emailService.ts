import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  // Para Gmail, habilite "apps menos seguros" ou configure uma senha de app.
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}