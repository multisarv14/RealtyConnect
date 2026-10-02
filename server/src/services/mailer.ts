import nodemailer from 'nodemailer';
import { config } from '../config';

/**
 * Outgoing email. Configure SMTP_HOST (and SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM) to enable it;
 * without that nothing is sent and callers are told so.
 */
let transport: nodemailer.Transporter | null | undefined;

function getTransport() {
  if (transport !== undefined) return transport;
  transport = config.smtp.host
    ? nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      })
    : null;
  return transport;
}

export const emailConfigured = () => getTransport() !== null;

/** Returns true when the mail server accepted the message. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const t = getTransport();
  if (!t) return false;
  try {
    await t.sendMail({ from: config.smtp.from, to, subject, text });
    return true;
  } catch (err) {
    console.error('[mail] delivery failed', err);
    return false;
  }
}
