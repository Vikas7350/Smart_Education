const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const { getSubscriptionStatus } = require('../middleware/checkSubscription');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.user._id);
    res.json(status);
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { planType } = req.body;

    if (!planType || !['MONTHLY', 'YEARLY'].includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    // Define plan amounts (in paise, so multiply by 100)
    const amounts = {
      MONTHLY: 10 * 100, // ₹10
      YEARLY: 100 * 100  // ₹100
    };

    const amount = amounts[planType];

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `sub_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        planType: planType,
        email: req.user.email
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order details to subscription (pending status)
    const expiryDate = new Date();
    if (planType === 'MONTHLY') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        planType: planType,
        activationDate: new Date(),
        expiryDate: expiryDate,
        paymentStatus: 'PENDING',
        razorpayOrderId: order.id,
        amount: amount / 100, // Convert back to rupees
        currency: 'INR'
      },
      { upsert: true, new: true }
    );

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Verify payment and activate subscription
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Find subscription by order ID
    const subscription = await Subscription.findOne({ 
      userId: req.user._id,
      razorpayOrderId: razorpay_order_id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update subscription with payment details
    subscription.paymentStatus = 'SUCCESS';
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpaySignature = razorpay_signature;
    subscription.activationDate = new Date();
    await subscription.save();

    res.json({
      message: 'Payment verified and subscription activated',
      subscription: {
        planType: subscription.planType,
        expiryDate: subscription.expiryDate,
        isActive: subscription.isActive()
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
});

// Get current subscription details
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.json({ hasSubscription: false });
    }

    const isActive = subscription.paymentStatus === 'SUCCESS' && subscription.expiryDate > new Date();

    res.json({
      hasSubscription: true,
      isActive,
      planType: subscription.planType,
      activationDate: subscription.activationDate,
      expiryDate: subscription.expiryDate,
      paymentStatus: subscription.paymentStatus,
      daysRemaining: isActive ? Math.ceil((subscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

