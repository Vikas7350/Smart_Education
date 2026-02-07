const express = require('express');
const Subscription = require('../models/Subscription');
const { auth } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get current user's subscription
router.get('/', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) return res.status(404).json({ message: 'No subscription found' });
    res.json(subscription);
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's subscription (alias endpoint)
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) return res.status(404).json({ message: 'No subscription found' });
    res.json(subscription);
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Razorpay order for subscription payment
router.post('/create-order', auth, async (req, res) => {
  try {
    const { planType } = req.body;

    // Define plan amounts (in paise: 1 INR = 100 paise)
    const planAmounts = {
      'MONTHLY': 9900,   // Rs. 99
      'YEARLY': 99900    // Rs. 999
    };

    const amount = planAmounts[planType] || 9900;

    // Create Razorpay order
    // Razorpay requires receipt length <= 40 chars. Use a shortened receipt.
    const shortUser = req.user._id.toString().slice(-8);
    const shortTs = Date.now().toString().slice(-8);
    const receipt = `sub_${shortUser}_${shortTs}`; // ~20 chars

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: req.user._id.toString(),
        planType: planType
      }
    });

    // Save pending subscription record
    let subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) {
      subscription = new Subscription({
        userId: req.user._id,
        planType: planType || 'MONTHLY',
        amount: amount / 100, // Convert paise to rupees
        expiryDate: new Date(Date.now() + (planType === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000),
        paymentStatus: 'PENDING',
        razorpayOrderId: order.id
      });
    } else {
      subscription.planType = planType || 'MONTHLY';
      subscription.amount = amount / 100;
      subscription.expiryDate = new Date(Date.now() + (planType === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000);
      subscription.paymentStatus = 'PENDING';
      subscription.razorpayOrderId = order.id;
    }

    await subscription.save();

    res.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      subscriptionId: subscription._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// Create or update a subscription (simple placeholder)
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planType, amount, expiryDate, paymentStatus } = req.body;

    let subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) {
      subscription = new Subscription({
        userId: req.user._id,
        planType: planType || 'MONTHLY',
        amount: amount || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30*24*60*60*1000),
        paymentStatus: paymentStatus || 'PENDING'
      });
    } else {
      subscription.planType = planType || subscription.planType;
      subscription.amount = amount || subscription.amount;
      subscription.expiryDate = expiryDate ? new Date(expiryDate) : subscription.expiryDate;
      subscription.paymentStatus = paymentStatus || subscription.paymentStatus;
    }

    await subscription.save();
    res.json(subscription);
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify the signature using HMAC SHA256
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid Razorpay signature for payment', razorpay_payment_id);
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
    }

    // Signature is valid, update subscription status
    const subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.paymentStatus = 'SUCCESS';
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.expiryDate = new Date(
      Date.now() + (subscription.planType === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000
    );
    await subscription.save();

    console.log(`✅ Payment verified for order ${razorpay_order_id}, payment ${razorpay_payment_id}`);
    res.json({ message: 'Payment verified successfully', subscription });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ message: 'Payment verification error', error: err.message });
  }
});

module.exports = router;
