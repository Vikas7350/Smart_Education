const Subscription = require('../models/Subscription');

// Middleware to check if user has active subscription
const checkSubscription = async (req, res, next) => {
  try {
    // Admin users bypass subscription check
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find active subscription
    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.status(403).json({ 
        message: 'Subscription required',
        subscriptionRequired: true,
        hasSubscription: false
      });
    }

    // Check if subscription is active
    const isActive = subscription.paymentStatus === 'SUCCESS' && subscription.expiryDate > new Date();

    if (!isActive) {
      return res.status(403).json({ 
        message: 'Subscription expired',
        subscriptionRequired: true,
        hasSubscription: true,
        expired: true,
        expiryDate: subscription.expiryDate
      });
    }

    // Attach subscription info to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to check subscription status (non-blocking)
const getSubscriptionStatus = async (userId) => {
  try {
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        planType: null,
        expiryDate: null
      };
    }

    const isActive = subscription.paymentStatus === 'SUCCESS' && subscription.expiryDate > new Date();

    return {
      hasSubscription: true,
      isActive,
      planType: subscription.planType,
      expiryDate: subscription.expiryDate,
      paymentStatus: subscription.paymentStatus
    };
  } catch (error) {
    console.error('Get subscription status error:', error);
    return {
      hasSubscription: false,
      isActive: false,
      planType: null,
      expiryDate: null
    };
  }
};

module.exports = { checkSubscription, getSubscriptionStatus };

