const nodemailer = require('nodemailer');
const { AppError } = require('../utils/errorHandler');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new AppError('SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.', 500);
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user,
      pass,
    },
  });
};

const getFromAddress = () => {
  const senderEmail = process.env.SUPER_ADMIN_EMAIL || process.env.SMTP_USER;
  const senderName = process.env.SUPER_ADMIN_NAME || 'WorkPulse Super Admin';
  return senderEmail ? `${senderName} <${senderEmail}>` : senderName;
};

const sendCredentialsEmail = async ({ to, name, password, role, teamNo, createdBy }) => {
  const transporter = getTransporter();
  const senderName = process.env.SUPER_ADMIN_NAME || 'WorkPulse Super Admin';

  const subject = 'Your WorkPulse account has been created';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 16px;">Welcome to WorkPulse</h2>
      <p>Your account has been created by ${createdBy?.first_name || senderName} ${createdBy?.last_name || ''}.</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Team No:</strong> ${teamNo || '-'}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please log in and change your password after your first sign in.</p>
    </div>
  `;

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
    text: `Welcome to WorkPulse. Your account was created for ${name}. Email: ${to}. Role: ${role}. Team No: ${teamNo || '-'}. Password: ${password}.`,
  });
};

module.exports = {
  sendCredentialsEmail,
};