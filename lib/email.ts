import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    const data = await resend.emails.send({
      from: from || '+Philia Hub <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Helper function to send verification email
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #d17251 0%, #e5ac6a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">+Philia Hub</h1>
          <p style="color: white; margin: 10px 0 0; font-size: 18px;">Find your people. Find your power.</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px;">
          <h2 style="color: #d17251; margin-top: 0;">Verify Your Email</h2>
          <p>Welcome to +Philia Hub! To complete your registration and start connecting with the LGBTQ+ community, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #d17251; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your email - +Philia Hub',
    html,
  });
}

// Helper function to send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/new-password/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #d17251 0%, #e5ac6a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">+Philia Hub</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px;">
          <h2 style="color: #d17251; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #d17251; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your password - +Philia Hub',
    html,
  });
}

// Helper function to send contact form notification
export async function sendContactNotification(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${formData.name} (${formData.email})</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
      </body>
    </html>
  `;

  return sendEmail({
    to: process.env.SUPPORT_INBOX || 'yuyourmother@gmail.com',
    subject: `Contact Form: ${formData.subject}`,
    html,
  });
}

