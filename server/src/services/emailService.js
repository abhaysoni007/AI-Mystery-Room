import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Generates a cryptographically random 6-digit numeric OTP code.
 */
export function generateOtpCode() {
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}

/**
 * Sends a 6-digit OTP code to the recipient email address.
 * Falls back gracefully to terminal console logging during development or testing.
 */
export async function sendOtpEmail({ email, otp, purpose = 'signup' }) {
  const purposeTitles = {
    signup: 'Verify Your Investigation Account',
    login: 'One-Time Security Login Code',
    reset_password: 'Password Reset Authorization Code',
  };

  const title = purposeTitles[purpose] || 'Your Verification Code';

  // Check if real SMTP credentials are provided and not in testing mode
  const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER);
  const isTestOrDev = env.NODE_ENV === 'test' || !hasSmtp;

  if (isTestOrDev) {
    console.log('\n======================================================');
    console.log(`[EMAIL DISPATCH - DEV SIMULATOR]`);
    console.log(`TO:      ${email}`);
    console.log(`SUBJECT: ${title}`);
    console.log(`PURPOSE: ${purpose.toUpperCase()}`);
    console.log(`CODE:    >>> ${otp} <<< (Expires in 10 minutes)`);
    console.log('======================================================\n');

    return {
      delivered: true,
      devMode: true,
      email,
      otp,
      purpose,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    const html = `
      <div style="font-family: 'Space Grotesk', -apple-system, sans-serif; background: #FFF9EE; padding: 40px; color: #191919;">
        <div style="max-width: 500px; margin: 0 auto; background: #FFFFFF; border: 3px solid #191919; box-shadow: 6px 6px 0 #191919; padding: 32px; border-radius: 8px;">
          <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-top: 0; color: #191919;">AI MYSTERY ROOM</h2>
          <p style="font-size: 15px; font-weight: 500; color: #191919;">${title}</p>
          <p style="font-size: 14px; color: #555555;">Use the single-use authorization code below to complete your authentication. This code expires in 10 minutes.</p>
          
          <div style="background: #FFE45E; border: 3px solid #191919; box-shadow: 4px 4px 0 #191919; padding: 16px; text-align: center; margin: 24px 0; border-radius: 6px;">
            <span style="font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #191919;">${otp}</span>
          </div>

          <p style="font-size: 12px; font-family: monospace; color: #777777;">If you did not request this verification code, please ignore this email.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: `AI Mystery Room: ${otp} is your verification code`,
      text: `Your AI Mystery Room verification code for ${purpose} is: ${otp}. It expires in 10 minutes.`,
      html,
    });

    return {
      delivered: true,
      devMode: false,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to dispatch SMTP email:', error.message);
    throw error;
  }
}
