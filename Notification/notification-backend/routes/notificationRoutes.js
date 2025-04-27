const express = require('express');
const router = express.Router();
const { sendOrderConfirmation, sendDeliveryAssignment } = require('../controllers/notificationController');

router.post('/order-confirmation', sendOrderConfirmation);
router.post('/delivery-assignment', sendDeliveryAssignment);

module.exports = router;