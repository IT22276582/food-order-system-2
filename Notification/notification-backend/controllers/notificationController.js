const { sendSMS } = require('../services/smsService');
const { sendEmail } = require('../services/emailService');

const sendOrderConfirmation = async (req, res) => {
  const { customerPhone, customerEmail, orderDetails } = req.body;

  if (!customerPhone || !customerEmail || !orderDetails) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const smsMessage = `Order #${orderDetails.orderId} confirmed! Total: LKR ${orderDetails.total}. Estimated delivery: ${orderDetails.estimatedDelivery}.`;
  const emailSubject = `Order Confirmation #${orderDetails.orderId}`;
  const emailText = `Thank you for your order!\nOrder ID: ${orderDetails.orderId}\nTotal: LKR ${orderDetails.total}\nEstimated Delivery: ${orderDetails.estimatedDelivery}`;
  const emailHtml = `<p>Thank you for your order!</p><p>Order ID: ${orderDetails.orderId}</p><p>Total: LKR ${orderDetails.total}</p><p>Estimated Delivery: ${orderDetails.estimatedDelivery}</p>`;

  try {
    await Promise.all([
      sendSMS(customerPhone, smsMessage),
      sendEmail(customerEmail, emailSubject, emailText, emailHtml),
    ]);
    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};

const sendDeliveryAssignment = async (req, res) => {
  const { driverPhone, orderDetails } = req.body;

  if (!driverPhone || !orderDetails) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const smsMessage = `New delivery assigned! Order #${orderDetails.orderId}. Customer: ${orderDetails.customerName}. Address: ${orderDetails.address}.`;

  try {
    await sendSMS(driverPhone, smsMessage);
    res.status(200).json({ message: 'Driver notification sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send driver notification' });
  }
};

module.exports = { sendOrderConfirmation, sendDeliveryAssignment };