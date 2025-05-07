const sgMail = require('@sendgrid/mail');
const config = require('../config/config');
const NotificationLog = require('../models/notificationLog');

sgMail.setApiKey(config.sendgrid.apiKey);

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: 'your_verified_email@domain.com', // Replace with your SendGrid verified sender
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);

    await NotificationLog.create({
      type: 'email',
      recipient: to,
      message: text,
      status: 'sent',
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    await NotificationLog.create({
      type: 'email',
      recipient: to,
      message: text,
      status: 'failed',
    });
    console.error('Email Error:', error);
    throw error;
  }
};

module.exports = { sendEmail };