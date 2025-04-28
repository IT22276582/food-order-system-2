// const { sendSMS } = require('../services/smsService');
// const { sendEmail } = require('../services/emailService');

// const sendOrderConfirmation = async (req, res) => {
//   const { customerPhone, customerEmail, orderDetails } = req.body;

//   if (!customerPhone || !customerEmail || !orderDetails) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const smsMessage = `Order #${orderDetails.orderId} confirmed! Total: LKR ${orderDetails.total}. Estimated delivery: ${orderDetails.estimatedDelivery}.`;
//   const emailSubject = `Order Confirmation #${orderDetails.orderId}`;
//   const emailText = `Thank you for your order!\nOrder ID: ${orderDetails.orderId}\nTotal: LKR ${orderDetails.total}\nEstimated Delivery: ${orderDetails.estimatedDelivery}`;
//   const emailHtml = `<p>Thank you for your order!</p><p>Order ID: ${orderDetails.orderId}</p><p>Total: LKR ${orderDetails.total}</p><p>Estimated Delivery: ${orderDetails.estimatedDelivery}</p>`;

//   try {
//     await Promise.all([
//       sendSMS(customerPhone, smsMessage),
//       sendEmail(customerEmail, emailSubject, emailText, emailHtml),
//     ]);
//     res.status(200).json({ message: 'Notifications sent successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send notifications' });
//   }
// };

// const sendDeliveryAssignment = async (req, res) => {
//   const { driverPhone, orderDetails } = req.body;

//   if (!driverPhone || !orderDetails) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const smsMessage = `New delivery assigned! Order #${orderDetails.orderId}. Customer: ${orderDetails.customerName}. Address: ${orderDetails.address}.`;

//   try {
//     await sendSMS(driverPhone, smsMessage);
//     res.status(200).json({ message: 'Driver notification sent' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send driver notification' });
//   }
// };

// module.exports = { sendOrderConfirmation, sendDeliveryAssignment };




import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOrderConfirmation = async (req, res) => {

  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  const { customerEmail, orderDetails } = req.body;

  if (!customerEmail || !orderDetails) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailSubject = `Order Confirmation #${orderDetails.orderId}`;
  const emailText = `Thank you for your order!\nOrder ID: ${orderDetails.orderId}\nTotal: LKR ${orderDetails.total}\nEstimated Delivery: ${orderDetails.estimatedDelivery}`;
  const emailHtml = `<p>Thank you for your order!</p><p>Order ID: ${orderDetails.orderId}</p><p>Total: LKR ${orderDetails.total}</p><p>Estimated Delivery: ${orderDetails.estimatedDelivery}</p>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    res.status(200).json({ message: 'Email notification sent successfully' });
  } catch (error) {
  
    // res.status(500).json({ error: 'Failed to send email notification' });
    res.status(500).json({ error: error.message});
  }
};

export const sendDeliveryAssignment = async (req, res) => {


  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const { driverEmail, orderDetails } = req.body;

  if (!driverEmail || !orderDetails) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailSubject = `New Delivery Assignment #${orderDetails.orderId}`;
  const emailText = `New delivery assigned!\nOrder #${orderDetails.orderId}\nCustomer: ${orderDetails.customerName}\nAddress: ${orderDetails.address}`;
  const emailHtml = `<p>New delivery assigned!</p><p>Order #${orderDetails.orderId}</p><p>Customer: ${orderDetails.customerName}</p><p>Address: ${orderDetails.address}</p>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: driverEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    res.status(200).json({ message: 'Driver email notification sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send driver email notification' });
  }
};

// export default { sendOrderConfirmation,sendDeliveryAssignment };