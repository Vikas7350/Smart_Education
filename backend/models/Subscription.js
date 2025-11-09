const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['MONTHLY', 'YEARLY'],
    required: true
  },
  activationDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick lookup
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ expiryDate: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.paymentStatus === 'SUCCESS' && this.expiryDate > new Date();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

