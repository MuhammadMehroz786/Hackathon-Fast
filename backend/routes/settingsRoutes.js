const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { sendTestEmail } = require('../utils/emailService');

const ENV_PATH = path.join(__dirname, '../.env');

/**
 * GET /api/settings/email
 * Get current email configuration (without exposing password)
 */
router.get('/email', (req, res) => {
  try {
    const config = {
      emailService: process.env.EMAIL_SERVICE || 'gmail',
      emailUser: process.env.EMAIL_USER || '',
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      recipients: {
        pdma: process.env.ALERT_EMAIL_PDMA || '',
        emergency: process.env.ALERT_EMAIL_EMERGENCY || '',
        community: process.env.ALERT_EMAIL_COMMUNITY || ''
      },
      thresholds: {
        temperature: parseFloat(process.env.TEMP_THRESHOLD) || 10,
        seismic: parseFloat(process.env.SEISMIC_THRESHOLD) || 0.5,
        waterLevel: parseFloat(process.env.WATER_LEVEL_INCREASE_THRESHOLD) || 20
      }
    };

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * POST /api/settings/email
 * Update email configuration
 */
router.post('/email', async (req, res) => {
  try {
    const {
      emailService,
      emailUser,
      emailPassword,
      pdmaEmail,
      emergencyEmail,
      communityEmail
    } = req.body;

    // Read current .env file
    let envContent = fs.readFileSync(ENV_PATH, 'utf8');

    // Update email service
    if (emailService) {
      envContent = envContent.replace(
        /EMAIL_SERVICE=.*/,
        `EMAIL_SERVICE=${emailService}`
      );
    }

    // Update email user
    if (emailUser) {
      envContent = envContent.replace(
        /EMAIL_USER=.*/,
        `EMAIL_USER=${emailUser}`
      );
      process.env.EMAIL_USER = emailUser;
    }

    // Update email password (only if provided)
    if (emailPassword) {
      envContent = envContent.replace(
        /EMAIL_PASSWORD=.*/,
        `EMAIL_PASSWORD=${emailPassword}`
      );
      process.env.EMAIL_PASSWORD = emailPassword;
    }

    // Update recipient emails
    if (pdmaEmail) {
      envContent = envContent.replace(
        /ALERT_EMAIL_PDMA=.*/,
        `ALERT_EMAIL_PDMA=${pdmaEmail}`
      );
      process.env.ALERT_EMAIL_PDMA = pdmaEmail;
    }

    if (emergencyEmail) {
      envContent = envContent.replace(
        /ALERT_EMAIL_EMERGENCY=.*/,
        `ALERT_EMAIL_EMERGENCY=${emergencyEmail}`
      );
      process.env.ALERT_EMAIL_EMERGENCY = emergencyEmail;
    }

    if (communityEmail) {
      envContent = envContent.replace(
        /ALERT_EMAIL_COMMUNITY=.*/,
        `ALERT_EMAIL_COMMUNITY=${communityEmail}`
      );
      process.env.ALERT_EMAIL_COMMUNITY = communityEmail;
    }

    // Write updated .env file
    fs.writeFileSync(ENV_PATH, envContent, 'utf8');

    // Reload email config (need to restart server for changes to take full effect)
    console.log('✅ Email configuration updated');
    console.log('⚠️  Note: Server restart recommended for changes to take full effect');

    res.json({
      success: true,
      message: 'Email configuration updated. Server restart recommended.',
      requiresRestart: true
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * POST /api/settings/test-email
 * Send a test email to verify configuration
 */
router.post('/test-email', async (req, res) => {
  try {
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email required' });
    }

    console.log(`📧 Sending test email to ${recipient}...`);
    const result = await sendTestEmail(recipient);

    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent to ${recipient}`,
        demo: result.demo
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/settings/thresholds
 * Update alert thresholds
 */
router.post('/thresholds', (req, res) => {
  try {
    const { temperature, seismic, waterLevel } = req.body;

    let envContent = fs.readFileSync(ENV_PATH, 'utf8');

    if (temperature !== undefined) {
      envContent = envContent.replace(
        /TEMP_THRESHOLD=.*/,
        `TEMP_THRESHOLD=${temperature}`
      );
      process.env.TEMP_THRESHOLD = temperature.toString();
    }

    if (seismic !== undefined) {
      envContent = envContent.replace(
        /SEISMIC_THRESHOLD=.*/,
        `SEISMIC_THRESHOLD=${seismic}`
      );
      process.env.SEISMIC_THRESHOLD = seismic.toString();
    }

    if (waterLevel !== undefined) {
      envContent = envContent.replace(
        /WATER_LEVEL_INCREASE_THRESHOLD=.*/,
        `WATER_LEVEL_INCREASE_THRESHOLD=${waterLevel}`
      );
      process.env.WATER_LEVEL_INCREASE_THRESHOLD = waterLevel.toString();
    }

    fs.writeFileSync(ENV_PATH, envContent, 'utf8');

    res.json({
      success: true,
      message: 'Alert thresholds updated',
      thresholds: {
        temperature: parseFloat(process.env.TEMP_THRESHOLD),
        seismic: parseFloat(process.env.SEISMIC_THRESHOLD),
        waterLevel: parseFloat(process.env.WATER_LEVEL_INCREASE_THRESHOLD)
      }
    });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ error: 'Failed to update thresholds' });
  }
});

module.exports = router;
