const { transporter, getRecipients } = require('../config/emailConfig');
const { generateAlertEmailHTML, generateAlertEmailText } = require('./emailTemplates');

/**
 * Email Service for sending GLOF alert notifications
 */

/**
 * Send alert email to appropriate recipients based on risk level
 * @param {Object} alertData - Alert information
 * @param {string} language - Language for email content ('en', 'ur', 'bs')
 * @returns {Promise} Result of email sending
 */
const sendAlertEmail = async (alertData, language = 'en') => {
  const { riskLevel, nodeId } = alertData;

  // Get recipients based on risk level
  const recipients = getRecipients(riskLevel);

  if (recipients.length === 0) {
    console.log(`📧 No email recipients for ${riskLevel} alerts`);
    return { success: true, message: 'No recipients for this alert level', sent: false };
  }

  // Generate email content
  const htmlContent = generateAlertEmailHTML(alertData, language);
  const textContent = generateAlertEmailText(alertData, language);

  // Email subject
  const emoji = {
    CRITICAL: '🚨🔴',
    HIGH: '⚠️🟠',
    MEDIUM: '⚡🟡',
    LOW: '✅🟢'
  }[riskLevel] || '📊';

  const subject = `${emoji} GLOF Alert: ${riskLevel} Risk at ${nodeId}`;

  // Email options
  const mailOptions = {
    from: {
      name: 'Project Barfani Alert System',
      address: process.env.EMAIL_USER || 'alerts@barfani.pk'
    },
    to: recipients.join(', '),
    subject,
    text: textContent,
    html: htmlContent,
    priority: riskLevel === 'CRITICAL' ? 'high' : 'normal'
  };

  // Send email or log in demo mode
  if (!transporter) {
    // Demo mode - log instead of sending
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL ALERT (DEMO MODE - Not Actually Sent)');
    console.log('='.repeat(60));
    console.log(`From: ${mailOptions.from.name} <${mailOptions.from.address}>`);
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Risk Level: ${riskLevel}`);
    console.log(`Location: ${nodeId}`);
    console.log(`Language: ${language.toUpperCase()}`);
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      message: 'Email logged (demo mode)',
      recipients,
      demo: true
    };
  }

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Alert email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipients: ${recipients.join(', ')}`);
    console.log(`   Risk Level: ${riskLevel}`);

    return {
      success: true,
      messageId: info.messageId,
      recipients,
      riskLevel,
      demo: false
    };
  } catch (error) {
    console.error('❌ Failed to send alert email:', error.message);

    return {
      success: false,
      error: error.message,
      recipients,
      riskLevel
    };
  }
};

/**
 * Send test email to verify email configuration
 */
const sendTestEmail = async (testRecipient) => {
  const testData = {
    nodeId: 'glacier_lake_01',
    riskLevel: 'MEDIUM',
    temperature: 5.2,
    seismicActivity: 0.4,
    waterLevel: 280,
    timestamp: new Date().toISOString(),
    message: 'This is a test alert from Project Barfani monitoring system.'
  };

  const htmlContent = generateAlertEmailHTML(testData, 'en');
  const textContent = generateAlertEmailText(testData, 'en');

  const mailOptions = {
    from: {
      name: 'Project Barfani Alert System',
      address: process.env.EMAIL_USER || 'alerts@barfani.pk'
    },
    to: testRecipient,
    subject: '🧪 Test Email - Project Barfani Alert System',
    text: textContent,
    html: htmlContent
  };

  if (!transporter) {
    console.log('\n📧 TEST EMAIL (Demo Mode):');
    console.log(`To: ${testRecipient}`);
    console.log('Email configuration not set up. Check .env file.\n');
    return { success: true, demo: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent to ${testRecipient}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, demo: false };
  } catch (error) {
    console.error(`❌ Failed to send test email:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send daily summary email to PDMA
 */
const sendDailySummaryEmail = async (summaryData, language = 'en') => {
  const recipients = [process.env.ALERT_EMAIL_PDMA || 'pdma@gilgit.gov.pk'];

  // Generate summary HTML (simplified for now)
  const subject = '📊 Daily GLOF Monitoring Summary - Project Barfani';

  const htmlContent = `
    <h2>Daily Summary</h2>
    <p>Total Alerts: ${summaryData.totalAlerts}</p>
    <p>Critical Alerts: ${summaryData.criticalAlerts}</p>
    <p>Active Nodes: ${summaryData.activeNodes}</p>
  `;

  if (!transporter) {
    console.log(`📧 Daily summary email (demo): ${summaryData.totalAlerts} alerts`);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'alerts@barfani.pk',
      to: recipients.join(', '),
      subject,
      html: htmlContent
    });

    console.log(`✅ Daily summary email sent`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send daily summary:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAlertEmail,
  sendTestEmail,
  sendDailySummaryEmail
};
