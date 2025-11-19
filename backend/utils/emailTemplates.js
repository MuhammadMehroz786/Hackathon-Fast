/**
 * Email Templates for GLOF Alert Notifications
 * Multi-language support (English, Urdu, Burushaski)
 */

const getRiskColorStyle = (riskLevel) => {
  const colors = {
    CRITICAL: { bg: '#DC2626', text: '#FFFFFF', border: '#991B1B' },
    HIGH: { bg: '#EA580C', text: '#FFFFFF', border: '#C2410C' },
    MEDIUM: { bg: '#EAB308', text: '#000000', border: '#A16207' },
    LOW: { bg: '#10B981', text: '#FFFFFF', border: '#047857' }
  };
  return colors[riskLevel] || colors.LOW;
};

const getAlertEmoji = (riskLevel) => {
  const emojis = {
    CRITICAL: '🚨🔴',
    HIGH: '⚠️🟠',
    MEDIUM: '⚡🟡',
    LOW: '✅🟢'
  };
  return emojis[riskLevel] || '📊';
};

/**
 * Generate HTML email template for alerts
 */
const generateAlertEmailHTML = (alertData, language = 'en') => {
  const { nodeId, riskLevel, temperature, seismicActivity, waterLevel, timestamp, message } = alertData;
  const colors = getRiskColorStyle(riskLevel);
  const emoji = getAlertEmoji(riskLevel);

  const translations = {
    en: {
      subject: `${emoji} GLOF Alert: ${riskLevel} Risk Detected`,
      title: 'Glacier Lake Outburst Flood (GLOF) Alert',
      subtitle: 'Early Warning System - Project Barfani',
      alertLevel: 'Alert Level',
      location: 'Location',
      readings: 'Sensor Readings',
      temperature: 'Temperature',
      seismic: 'Seismic Activity',
      waterLevel: 'Water Level',
      timestamp: 'Detection Time',
      action: 'Recommended Actions',
      footer: 'This is an automated alert from Project Barfani GLOF monitoring system.',
      contactPDMA: 'Contact PDMA Gilgit-Baltistan immediately',
      evacuate: 'Prepare for possible evacuation',
      monitor: 'Continue monitoring situation',
      stay: 'Situation normal, stay informed'
    },
    ur: {
      subject: `${emoji} GLOF الرٹ: ${riskLevel} خطرہ کی سطح`,
      title: 'گلیشیئر جھیل سیلاب (GLOF) انتباہ',
      subtitle: 'ابتدائی وارننگ سسٹم - پروجیکٹ برفانی',
      alertLevel: 'الرٹ کی سطح',
      location: 'مقام',
      readings: 'سینسر ریڈنگز',
      temperature: 'درجہ حرارت',
      seismic: 'زلزلے کی سرگرمی',
      waterLevel: 'پانی کی سطح',
      timestamp: 'وقت',
      action: 'تجویز کردہ اقدامات',
      footer: 'یہ پروجیکٹ برفانی GLOF مانیٹرنگ سسٹم کی خودکار الرٹ ہے۔',
      contactPDMA: 'فوری طور پر PDMA گلگت بلتستان سے رابطہ کریں',
      evacuate: 'ممکنہ انخلا کی تیاری کریں',
      monitor: 'صورتحال کی نگرانی جاری رکھیں',
      stay: 'صورتحال معمول پر ہے، باخبر رہیں'
    },
    bs: {
      subject: `${emoji} GLOF Khabardári: ${riskLevel} Khatara`,
      title: 'Glacier Lake Selab (GLOF) Khabardári',
      subtitle: 'Pehle Warning System - Barfani Project',
      alertLevel: 'Alert Daraja',
      location: 'Jagah',
      readings: 'Sensor Readings',
      temperature: 'Tápman',
      seismic: 'Zalzala Activity',
      waterLevel: 'Hik Level',
      timestamp: 'Waqt',
      action: 'Tavsiya Actions',
      footer: 'Ye Barfani Project GLOF monitoring system ki automatic alert.',
      contactPDMA: 'Fauran PDMA Gilgit-Baltistan se rabita',
      evacuate: 'Mumkin evacuation ki tayyari',
      monitor: 'Halat ki nigrani jari',
      stay: 'Halat normal, khabardar rahen'
    }
  };

  const t = translations[language] || translations.en;

  const actionText = {
    CRITICAL: t.contactPDMA + ' • ' + t.evacuate,
    HIGH: t.evacuate + ' • ' + t.monitor,
    MEDIUM: t.monitor,
    LOW: t.stay
  }[riskLevel];

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${emoji} ${t.title}</h1>
              <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 14px;">${t.subtitle}</p>
            </td>
          </tr>

          <!-- Alert Level Banner -->
          <tr>
            <td style="background-color: ${colors.bg}; padding: 20px 40px; text-align: center; border-left: 6px solid ${colors.border};">
              <h2 style="margin: 0; color: ${colors.text}; font-size: 24px; font-weight: bold; text-transform: uppercase;">
                ${t.alertLevel}: ${riskLevel}
              </h2>
            </td>
          </tr>

          <!-- Alert Message -->
          <tr>
            <td style="padding: 30px 40px;">
              <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400E; font-size: 16px; line-height: 1.5;">
                  <strong>⚠️ ${message}</strong>
                </p>
              </div>

              <!-- Location -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: bold;">📍 ${t.location}</h3>
                <p style="margin: 0; color: #4B5563; font-size: 18px; font-weight: 600;">${nodeId}</p>
              </div>

              <!-- Sensor Readings -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; font-weight: bold;">📊 ${t.readings}</h3>

                <table width="100%" cellpadding="12" cellspacing="0" style="border: 2px solid #E5E7EB; border-radius: 8px;">
                  <tr style="background-color: #F9FAFB;">
                    <td style="border-bottom: 1px solid #E5E7EB; padding: 12px;">
                      <strong style="color: #EF4444;">🌡️ ${t.temperature}:</strong>
                    </td>
                    <td style="border-bottom: 1px solid #E5E7EB; padding: 12px; text-align: right;">
                      <span style="font-size: 18px; font-weight: bold; color: #1F2937;">${temperature}°C</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #E5E7EB; padding: 12px;">
                      <strong style="color: #F59E0B;">📊 ${t.seismic}:</strong>
                    </td>
                    <td style="border-bottom: 1px solid #E5E7EB; padding: 12px; text-align: right;">
                      <span style="font-size: 18px; font-weight: bold; color: #1F2937;">${seismicActivity}</span>
                    </td>
                  </tr>
                  <tr style="background-color: #F9FAFB;">
                    <td style="padding: 12px;">
                      <strong style="color: #3B82F6;">💧 ${t.waterLevel}:</strong>
                    </td>
                    <td style="padding: 12px; text-align: right;">
                      <span style="font-size: 18px; font-weight: bold; color: #1F2937;">${waterLevel} cm</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Timestamp -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  <strong>🕐 ${t.timestamp}:</strong> ${new Date(timestamp).toLocaleString()}
                </p>
              </div>

              <!-- Recommended Actions -->
              <div style="background-color: ${colors.bg}10; border: 2px solid ${colors.border}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: bold;">⚡ ${t.action}</h3>
                <p style="margin: 0; color: #1F2937; font-size: 15px; line-height: 1.6;">
                  ${actionText}
                </p>
              </div>

              <!-- CTA Button -->
              ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="display: inline-block; background-color: ${colors.bg}; color: ${colors.text}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  📺 View Live Dashboard
                </a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px;">${t.footer}</p>
              <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
                🏔️ Project Barfani | Glacier Monitoring System<br>
                Northern Pakistan GLOF Early Warning
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generate plain text version (for email clients that don't support HTML)
 */
const generateAlertEmailText = (alertData, language = 'en') => {
  const { nodeId, riskLevel, temperature, seismicActivity, waterLevel, timestamp, message } = alertData;
  const emoji = getAlertEmoji(riskLevel);

  const translations = {
    en: {
      title: 'GLOF ALERT',
      level: 'Alert Level',
      location: 'Location',
      message: 'Message',
      readings: 'Sensor Readings',
      temp: 'Temperature',
      seismic: 'Seismic Activity',
      water: 'Water Level',
      time: 'Time',
      dashboard: 'View Dashboard'
    },
    ur: {
      title: 'GLOF الرٹ',
      level: 'الرٹ کی سطح',
      location: 'مقام',
      message: 'پیغام',
      readings: 'سینسر ریڈنگز',
      temp: 'درجہ حرارت',
      seismic: 'زلزلہ',
      water: 'پانی',
      time: 'وقت',
      dashboard: 'ڈیش بورڈ دیکھیں'
    },
    bs: {
      title: 'GLOF KHABARDÁRI',
      level: 'Alert Daraja',
      location: 'Jagah',
      message: 'Paigham',
      readings: 'Sensor Readings',
      temp: 'Tápman',
      seismic: 'Zalzala',
      water: 'Hik',
      time: 'Waqt',
      dashboard: 'Dashboard dekho'
    }
  };

  const t = translations[language] || translations.en;

  return `
${emoji} ${t.title}: ${riskLevel}
${'='.repeat(50)}

${t.level}: ${riskLevel}
${t.location}: ${nodeId}
${t.message}: ${message}

${t.readings}:
  ${t.temp}: ${temperature}°C
  ${t.seismic}: ${seismicActivity}
  ${t.water}: ${waterLevel} cm

${t.time}: ${new Date(timestamp).toLocaleString()}

${t.dashboard}: http://localhost:3000

---
Project Barfani - GLOF Monitoring System
  `;
};

module.exports = {
  generateAlertEmailHTML,
  generateAlertEmailText
};
