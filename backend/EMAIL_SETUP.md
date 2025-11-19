# Email Alert System - Setup Guide

## Overview

Project Barfani now includes an automated email alert system that sends notifications to authorities and communities when GLOF (Glacial Lake Outburst Flood) risks are detected.

## Features

✅ **Multi-Language Support**: Emails sent in English, Urdu, and Burushaski
✅ **Risk-Based Recipients**: Different alert levels notify different groups
✅ **Beautiful HTML Templates**: Professional, mobile-responsive email design
✅ **Priority Alerts**: Critical alerts marked as high priority
✅ **Demo Mode**: Works without configuration for testing

## Alert Distribution

| Risk Level | Recipients |
|------------|-----------|
| **CRITICAL** | PDMA + Emergency Response + Community Leaders |
| **HIGH** | PDMA + Emergency Response |
| **MEDIUM** | PDMA Only |
| **LOW** | No email (logged only) |

## Setup Instructions

### Option 1: Gmail (Recommended for Demo)

1. **Create App Password** (Required for Gmail):
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **Update `.env` file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

3. **Set Recipients**:
   ```env
   ALERT_EMAIL_PDMA=pdma@gilgit.gov.pk
   ALERT_EMAIL_EMERGENCY=emergency@barfani.pk
   ALERT_EMAIL_COMMUNITY=community@hunza.pk
   ```

### Option 2: SendGrid (For Production)

1. Sign up at https://sendgrid.com
2. Create an API Key
3. Update `.env`:
   ```env
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### Option 3: Other Providers

Supported services: `outlook`, `yahoo`, `hotmail`, `icloud`

```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## Testing

### Send Test Email

```bash
# In Node.js console or create a test script
const { sendTestEmail } = require('./utils/emailService');
sendTestEmail('your-test-email@example.com');
```

### Trigger Demo Alert

```bash
# Run critical test scenario
cd backend
node testData.js continuous 3 critical
```

This will:
1. Generate critical sensor readings
2. Trigger alert system
3. Send emails to all configured recipients
4. Display in dashboard

## Demo Mode

If email credentials are not configured, the system runs in DEMO mode:
- Emails are **logged to console** instead of being sent
- All functionality works for demonstration
- Perfect for hackathon presentation

**Console output example:**
```
==========================================================
📧 EMAIL ALERT (DEMO MODE - Not Actually Sent)
==========================================================
From: Project Barfani Alert System <alerts@barfani.pk>
To: pdma@gilgit.gov.pk, emergency@barfani.pk
Subject: 🚨🔴 GLOF Alert: CRITICAL Risk at glacier_lake_01
Risk Level: CRITICAL
Location: glacier_lake_01
Language: EN
==========================================================
```

## Email Template Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Risk Color Coding**:
  - 🔴 Red for CRITICAL
  - 🟠 Orange for HIGH
  - 🟡 Yellow for MEDIUM
  - 🟢 Green for LOW
- **Sensor Data Table**: Temperature, seismic activity, water level
- **Action Recommendations**: Based on risk level
- **Dashboard Link**: Direct link to live monitoring
- **Multi-Language**: Automatic translation to Urdu and Burushaski

## Email Content

Each alert email includes:

1. **Header**: Project branding with gradient
2. **Alert Level Banner**: Color-coded risk level
3. **Alert Message**: Human-readable warning
4. **Location**: Sensor node ID and location name
5. **Sensor Readings**:
   - Temperature (°C)
   - Seismic Activity (magnitude)
   - Water Level (cm)
6. **Detection Time**: Timestamp
7. **Recommended Actions**: Specific to risk level
8. **Dashboard Link**: Live monitoring access
9. **Footer**: System information

## Troubleshooting

**Emails not sending:**
- Check email credentials in `.env`
- For Gmail, ensure App Password is used (not regular password)
- Check firewall/network allows SMTP traffic
- Review console logs for error messages

**Only some recipients receive emails:**
- Verify email addresses in `.env`
- Check spam folders
- Confirm email service limits aren't exceeded

**Formatting issues:**
- Some email clients may not support HTML
- Plain text version is automatically included

## Security Notes

- **Never commit `.env`** file with real credentials
- Use App Passwords, not main account passwords
- Rotate credentials regularly
- Monitor email sending quotas:
  - Gmail: 500/day for free accounts
  - SendGrid: 100/day free tier

## Production Deployment

For production use:

1. **Use SendGrid or AWS SES** for reliable delivery
2. **Set up SPF/DKIM** records for email authentication
3. **Monitor delivery rates** and bounce handling
4. **Implement rate limiting** to prevent spam
5. **Add unsubscribe links** (if required by law)
6. **Log all sent emails** for audit trail

## Files Modified/Added

- `config/emailConfig.js` - Email transporter configuration
- `utils/emailTemplates.js` - HTML and text email templates
- `utils/emailService.js` - Email sending logic
- `routes/sensorRoutes.js` - Integration with alert system
- `.env` - Email configuration variables

## Cost Considerations

- **Gmail**: Free (500 emails/day limit)
- **SendGrid**: Free tier 100/day, $15/month for 50K
- **AWS SES**: $0.10 per 1,000 emails
- **Recommended**: SendGrid or AWS SES for production

---

**Ready to save lives with automated alerts!** 🏔️📧

For questions during the hackathon, check the console logs for email status.
