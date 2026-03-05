import nodemailer from 'nodemailer';

// In development, use Ethereal (fake SMTP) or log to console
// In production, configure real SMTP (Gmail, SendGrid, etc.)
let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Production: use configured SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: use Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

const APP_NAME = 'CRM Pro';
const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@crm-pro.vn';

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `🔐 ${APP_NAME} - Đặt lại mật khẩu`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 28px; margin: 0;">💎 ${APP_NAME}</h1>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #1e293b;">Xin chào ${name},</h2>
          <p style="color: #475569; line-height: 1.6;">Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhập mã xác thực sau:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #667eea; background: #eff6ff; padding: 16px 32px; border-radius: 12px; display: inline-block;">${code}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu thay đổi, hãy bỏ qua email này.</p>
        </div>
      </div>
    `,
  });

  // Log preview URL for development (Ethereal)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📧 Preview email URL:', previewUrl);
  }

  return { previewUrl, messageId: info.messageId, code };
}

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `✉️ ${APP_NAME} - Xác thực email`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; font-size: 28px; margin: 0;">💎 ${APP_NAME}</h1>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #1e293b;">Xin chào ${name},</h2>
          <p style="color: #475569; line-height: 1.6;">Mã xác thực email của bạn là:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #667eea; background: #eff6ff; padding: 16px 32px; border-radius: 12px; display: inline-block;">${code}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Mã có hiệu lực trong 10 phút. Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📧 Preview email URL:', previewUrl);
  }

  return { previewUrl, messageId: info.messageId, code };
}
