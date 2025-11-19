const nodemailer = require('nodemailer');

/**
 * Email Configuration for Alert Notifications
 * Supports multiple email providers (Gmail, Outlook, SendGrid, etc.)
 */

// Create email transporter
const createTransporter = () => {
  // For demo/development: Use ethereal.email (fake SMTP)
  // For production: Use Gmail, SendGrid, AWS SES, etc.

  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('📧 Email service running in DEMO mode (emails logged, not sent)');
    return null; // Will log emails instead of sending
  }

  const config = {
    service: emailService,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // For custom SMTP (like SendGrid)
  if (emailService === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Email recipients configuration
const getRecipients = (alertLevel) => {
  const recipients = {
    // Critical alerts go to everyone
    CRITICAL: [
      process.env.ALERT_EMAIL_PDMA || 'pdma@gilgit.gov.pk',
      process.env.ALERT_EMAIL_EMERGENCY || 'emergency@barfani.pk',
      process.env.ALERT_EMAIL_COMMUNITY || 'community@hunza.pk'
    ],
    // High alerts go to PDMA and emergency
    HIGH: [
      process.env.ALERT_EMAIL_PDMA || 'pdma@gilgit.gov.pk',
      process.env.ALERT_EMAIL_EMERGENCY || 'emergency@barfani.pk'
    ],
    // Medium alerts go to PDMA only
    MEDIUM: [
      process.env.ALERT_EMAIL_PDMA || 'pdma@gilgit.gov.pk'
    ],
    // Low alerts are logged but not emailed
    LOW: []
  };

  return recipients[alertLevel] || [];
};

module.exports = {
  transporter,
  getRecipients,
  createTransporter
};
