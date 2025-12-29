import { EmailClient, EmailMessage } from '@azure/communication-email';

const connectionString = process.env.AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING;
const senderAddress = process.env.AZURE_COMMUNICATION_EMAIL_SENDER || 'DoNotReply@hivecraftdigital.com';

let emailClient: EmailClient | null = null;

/**
 * Initialize email client
 */
function getEmailClient(): EmailClient {
  if (!emailClient && connectionString) {
    emailClient = new EmailClient(connectionString);
  }
  if (!emailClient) {
    throw new Error('Email service not configured. Set AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING in .env');
  }
  return emailClient;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  plainTextContent?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Send an email using Azure Communication Services
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    const client = getEmailClient();

    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const message: EmailMessage = {
      senderAddress,
      content: {
        subject: options.subject,
        html: options.htmlContent || '',
        plainText: options.plainTextContent || '',
      },
      recipients: {
        to: recipients.map(email => ({ address: email })),
        cc: options.cc?.map(email => ({ address: email })),
        bcc: options.bcc?.map(email => ({ address: email })),
      },
    };

    const poller = await client.beginSend(message);
    await poller.pollUntilDone();

    console.log(`Email sent to ${recipients.join(', ')}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFB800 0%, #FF8A00 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #FFB800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to HiveCraft Digital! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for joining HiveCraft Digital! We're excited to have you on board.</p>
          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>View your projects and track progress</li>
            <li>Communicate with our team in real-time</li>
            <li>Upload and share files</li>
            <li>Review previews and provide feedback</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal" class="button">Go to Portal</a>
          <p>If you have any questions, feel free to reach out to our team.</p>
          <p>Best regards,<br>The HiveCraft Digital Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 HiveCraft Digital. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const plainTextContent = `
    Welcome to HiveCraft Digital!
    
    Hi ${name},
    
    Thank you for joining HiveCraft Digital! We're excited to have you on board.
    
    Your account has been successfully created. You can now access your portal at:
    ${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal
    
    If you have any questions, feel free to reach out to our team.
    
    Best regards,
    The HiveCraft Digital Team
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to HiveCraft Digital! 🎉',
    htmlContent,
    plainTextContent,
  });
}

/**
 * Send project status update email
 */
export async function sendProjectUpdateEmail(
  email: string,
  name: string,
  projectTitle: string,
  updateMessage: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFB800 0%, #FF8A00 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .update-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #FFB800; }
        .button { display: inline-block; padding: 12px 30px; background: #FFB800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>There's an update on your project:</p>
          <div class="update-box">
            <h3>${projectTitle}</h3>
            <p>${updateMessage}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/projects" class="button">View Project</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Update: ${projectTitle}`,
    htmlContent,
  });
}

/**
 * Send new message notification email
 */
export async function sendMessageNotificationEmail(
  email: string,
  name: string,
  projectTitle: string,
  senderName: string,
  messagePreview: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFB800 0%, #FF8A00 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .message-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #FFB800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Message 💬</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p><strong>${senderName}</strong> sent you a message about <strong>${projectTitle}</strong>:</p>
          <div class="message-box">
            <p>${messagePreview}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/projects" class="button">View Message</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `New message from ${senderName}`,
    htmlContent,
  });
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return Boolean(connectionString);
}
