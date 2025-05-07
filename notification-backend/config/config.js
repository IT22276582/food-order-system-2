require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3003,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
  mongoUri: process.env.MONGO_URI,
};