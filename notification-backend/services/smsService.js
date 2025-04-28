const twilio = require('twilio');
const config = require('../config/config');
const NotificationLog = require('../models/notificationLog');

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to,
    });

    await NotificationLog.create({
      type: 'SMS',
      recipient: to,
      message,
      status: 'sent',
    });

    console.log(`SMS sent to ${to}`);
  } catch (error) {
    await NotificationLog.create({
      type: 'SMS',
      recipient: to,
      message,
      status: 'failed',
    });
    console.error('SMS Error:', error);
    throw error;
  }
};

module.exports = { sendSMS };