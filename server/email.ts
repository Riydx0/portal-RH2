import nodemailer from "nodemailer";
import { db } from "./db.js";
import { settings as settingsTable } from "@shared/schema.js";
import { eq } from "drizzle-orm";

let cachedTransporter: any = null;
let lastCacheTime = 0;

async function getTransporter() {
  const now = Date.now();
  // Refresh cache every 5 minutes
  if (cachedTransporter && (now - lastCacheTime) < 5 * 60 * 1000) {
    return cachedTransporter;
  }

  try {
    // Try to load settings from database first
    const settingsResults = await Promise.all([
      db.select().from(settingsTable).where(eq(settingsTable.key, "SMTP_HOST")).limit(1),
      db.select().from(settingsTable).where(eq(settingsTable.key, "SMTP_PORT")).limit(1),
      db.select().from(settingsTable).where(eq(settingsTable.key, "SMTP_USER")).limit(1),
      db.select().from(settingsTable).where(eq(settingsTable.key, "SMTP_PASSWORD")).limit(1),
      db.select().from(settingsTable).where(eq(settingsTable.key, "SMTP_SECURE")).limit(1),
      db.select().from(settingsTable).where(eq(settingsTable.key, "SMTP_FROM")).limit(1),
    ]);

    const host = (settingsResults[0][0]?.value || process.env.SMTP_HOST || "localhost").trim();
    const port = parseInt((settingsResults[1][0]?.value || process.env.SMTP_PORT || "587").trim());
    const user = (settingsResults[2][0]?.value || process.env.SMTP_USER || "").trim();
    const pass = (settingsResults[3][0]?.value || process.env.SMTP_PASSWORD || "").trim();
    const secure = ((settingsResults[4][0]?.value || process.env.SMTP_SECURE || "false").trim()) === "true";
    const from = (settingsResults[5][0]?.value || process.env.SMTP_FROM || "noreply@example.com").trim();

    const transportConfig: any = {
      host,
      port,
      secure,
    };

    if (user && pass) {
      transportConfig.auth = { user, pass };
    }

    cachedTransporter = nodemailer.createTransport(transportConfig);

    lastCacheTime = now;
    return cachedTransporter;
  } catch (error) {
    // Fallback to environment variables if database fails
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      } : undefined,
    });
    lastCacheTime = now;
    return cachedTransporter;
  }
}

export async function sendSubscriptionEmail(
  email: string,
  planName: string,
  price: number
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Subscription Confirmed!</h2>
      <p>Dear Customer,</p>
      <p>Thank you for subscribing to our <strong>${planName}</strong> plan.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Monthly Cost:</strong> $${(price / 100).toFixed(2)}</p>
      </div>
      <p>Your subscription is now active. You can manage your subscription anytime in your dashboard.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The Support Team</p>
    </div>
  `;

  const transporter = await getTransporter();
  const smtpFrom = process.env.SMTP_FROM || "noreply@example.com";
  return transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: `Welcome to ${planName} Plan`,
    html: htmlContent,
  });
}

export async function sendInvoiceEmail(
  email: string,
  invoiceNumber: string,
  amount: number,
  dueDate?: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Invoice #${invoiceNumber}</h2>
      <p>Dear Customer,</p>
      <p>Your invoice is ready. Please see the details below:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
        ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ""}
      </div>
      <p>Please make payment at your earliest convenience.</p>
      <p>Best regards,<br>The Support Team</p>
    </div>
  `;

  const transporter = await getTransporter();
  const smtpFrom = process.env.SMTP_FROM || "noreply@example.com";
  return transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: `Invoice #${invoiceNumber}`,
    html: htmlContent,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our Platform!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for creating an account with us. We're excited to have you on board!</p>
      <p>You can now:</p>
      <ul>
        <li>Access all software downloads</li>
        <li>Create and manage support tickets</li>
        <li>View your subscription and invoices</li>
        <li>Manage your account settings</li>
      </ul>
      <p style="margin-top: 30px;">Best regards,<br>The Support Team</p>
    </div>
  `;

  const transporter = await getTransporter();
  const smtpFrom = process.env.SMTP_FROM || "noreply@example.com";
  return transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Welcome to Our Platform",
    html: htmlContent,
  });
}
