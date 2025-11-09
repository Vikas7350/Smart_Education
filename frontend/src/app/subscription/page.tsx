'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getStoredUser } from '@/lib/auth'
import { subscriptionAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { Check, Lock, Loader2, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(getStoredUser())
    loadSubscriptionStatus()
  }, [router])

  const loadSubscriptionStatus = async () => {
    try {
      const response = await subscriptionAPI.getCurrent()
      setSubscriptionStatus(response.data)
    } catch (error) {
      console.error('Failed to load subscription status', error)
    }
  }

  const handlePayment = async (planType: 'MONTHLY' | 'YEARLY') => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please wait...')
      return
    }

    setLoading(true)
    try {
      // Create order
      const orderResponse = await subscriptionAPI.createOrder(planType)
      const { orderId, amount, currency, keyId } = orderResponse.data

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Synapse Academy',
        description: `Premium ${planType === 'MONTHLY' ? 'Monthly' : 'Yearly'} Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await subscriptionAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            toast.success('Subscription activated successfully!')
            await loadSubscriptionStatus()
            router.push('/dashboard')
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment verification failed')
          }
        },
        prefill: {
          name: user?.name || 'Student',
          email: user?.email || 'student@example.com'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      setLoading(false)
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  const plans = [
    {
      type: 'MONTHLY' as const,
      name: 'Premium Monthly',
      price: 10,
      period: 'month',
      description: 'Perfect for short-term learning',
      features: [
        'Full access to all Class 10 subjects & chapters',
        'Unlimited quizzes',
        'AI-powered summary & doubt-solving',
        'Download notes as PDF',
        'Leaderboard, streak rewards, badges'
      ]
    },
    {
      type: 'YEARLY' as const,
      name: 'Premium Yearly',
      price: 100,
      period: 'year',
      description: 'Best value for long-term learning',
      savings: 'Save ₹20',
      popular: true,
      features: [
        'Full access to all Class 10 subjects & chapters',
        'Unlimited quizzes',
        'AI-powered summary & doubt-solving',
        'Download notes as PDF',
        'Leaderboard, streak rewards, badges',
        'Priority support'
      ]
    }
  ]

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error('Failed to load payment gateway')}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Unlock full access to all Class 10 CBSE content
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscriptionStatus?.hasSubscription && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className={`p-6 rounded-xl shadow-md ${
                subscriptionStatus.isActive 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {subscriptionStatus.isActive ? '✅ Active Subscription' : '⚠️ Subscription Expired'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subscriptionStatus.isActive ? (
                        <>
                          {subscriptionStatus.planType === 'MONTHLY' ? 'Monthly' : 'Yearly'} Plan • 
                          {subscriptionStatus.daysRemaining > 0 ? (
                            <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                              {subscriptionStatus.daysRemaining} days remaining
                            </span>
                          ) : (
                            <span className="ml-1">Expired</span>
                          )}
                        </>
                      ) : (
                        'Your subscription has expired. Renew now to continue learning.'
                      )}
                    </p>
                  </div>
                  {!subscriptionStatus.isActive && (
                    <button
                      onClick={() => handlePayment(subscriptionStatus.planType || 'MONTHLY')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Renew Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plan.period}
                    </span>
                  </div>
                  {plan.savings && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                      {plan.savings}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan.type)}
                  disabled={loading || !razorpayLoaded}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {subscriptionStatus?.isActive && subscriptionStatus?.planType === plan.type ? (
                        'Current Plan'
                      ) : (
                        `Subscribe Now`
                      )}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Security Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔒 Secure payment powered by Razorpay. Your payment information is safe and encrypted.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

