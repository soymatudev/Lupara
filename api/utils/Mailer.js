const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendResetPasswordEmail = async (emailTo, resetUrl) => {
    const mailOptions = {
        from: '"TechReserva Support" <noreply@techreserva.com>',
        to: emailTo,
        subject: 'Password Reset Request',
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb;">Restablece tu contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Restablecer Contraseña</a>
            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Este enlace expirará en 1 hora. Si no solicitaste esto, ignora este correo.</p>
        </div>
        `,
    }
    return transporter.sendMail(mailOptions);
}