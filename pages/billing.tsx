import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { 
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { 
  CheckSuccess,
  CreditCard,
  WarningAlert,
  ErrorCross
} from '../components/icons'

interface PricingPlan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: any
  limits: any
  is_active: boolean
}

interface Subscription {
  id: string
  plan_id: string
  status: string
  billing_cycle: string
  current_period_start: string
  current_period_end: string
  pricing_plans?: PricingPlan
}

interface UsageSummary {
  preorder_orders: { current: number; limit: number }
  restock_emails: { current: number; limit: number }
  partial_payments: { current: number; limit: number }
}

export default function BillingPage() {
  const router = useRouter()
  const { shop } = router.query
  
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (shop) {
      fetchBillingData()
    }
  }, [shop])

  const fetchBillingData = async () => {
    try {
      const [plansRes, subscriptionRes, usageRes] = await Promise.all([
        fetch(`/api/billing/plans?shop=${shop}`),
        fetch(`/api/billing/subscription?shop=${shop}`),
        fetch(`/api/billing/usage?shop=${shop}`)
      ])

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])
      }

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json()
        setCurrentSubscription(subscriptionData.subscription)
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsageSummary(usageData.usage)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    setUpgrading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/billing/subscription?shop=${shop}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data.subscription)
        setMessage({ type: 'success', text: 'Plan updated successfully!' })
        await fetchBillingData() // Refresh data
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update plan' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating your plan' })
    } finally {
      setUpgrading(false)
    }
  }

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === 0) return 0
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout title="Billing - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    )
  }

  const currentPlan = currentSubscription?.pricing_plans || plans.find(p => p.name === 'Free')
  const isFreePlan = currentPlan?.name === 'Free'

  return (
    <Layout title="Billing & Subscription - PreOrder Pro" shop={shop as string}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">
            Manage your subscription and view usage statistics
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckSuccess size={20} className="text-green-400" />
                ) : (
                  <ErrorCross size={20} className="text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan & Usage */}
          <div className="lg:col-span-1">
            {/* Current Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{currentPlan?.name}</h3>
                  <p className="text-gray-600">
                    ${currentPlan?.price_monthly}/month
                  </p>
                </div>
                {!isFreePlan && (
                  <SparklesIcon className="h-8 w-8 text-blue-500" />
                )}
              </div>

              {currentSubscription && !isFreePlan && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Billing Cycle</span>
                    <span className="capitalize">{currentSubscription.billing_cycle}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Next Billing</span>
                    <span>{formatDate(currentSubscription.current_period_end)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Status</span>
                    <span className={`capitalize ${
                      currentSubscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentSubscription.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Statistics */}
            {usageSummary && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h2>
                
                <div className="space-y-4">
                  {/* Preorder Orders */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Preorder Orders</span>
                      <span>{usageSummary.preorder_orders.current} / {usageSummary.preorder_orders.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUsageColor(
                          getUsagePercentage(usageSummary.preorder_orders.current, usageSummary.preorder_orders.limit)
                        )}`}
                        style={{ 
                          width: `${getUsagePercentage(usageSummary.preorder_orders.current, usageSummary.preorder_orders.limit)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Restock Emails */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Restock Emails</span>
                      <span>{usageSummary.restock_emails.current} / {usageSummary.restock_emails.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUsageColor(
                          getUsagePercentage(usageSummary.restock_emails.current, usageSummary.restock_emails.limit)
                        )}`}
                        style={{ 
                          width: `${getUsagePercentage(usageSummary.restock_emails.current, usageSummary.restock_emails.limit)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Partial Payments */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Partial Payments</span>
                      <span>
                        {usageSummary.partial_payments.limit > 0 ? 'Unlimited' : 'Not Available'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          usageSummary.partial_payments.limit > 0 ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ 
                          width: usageSummary.partial_payments.limit > 0 ? '100%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Usage Warning */}
                {(getUsagePercentage(usageSummary.preorder_orders.current, usageSummary.preorder_orders.limit) >= 80 ||
                  getUsagePercentage(usageSummary.restock_emails.current, usageSummary.restock_emails.limit) >= 80) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <WarningAlert size={16} className="text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">Usage Warning</p>
                        <p className="text-sm text-yellow-700">
                          You're approaching your monthly limits. Consider upgrading to Pro for higher limits.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = currentPlan?.id === plan.id
                const isFree = plan.name === 'Free'
                
                return (
                  <div 
                    key={plan.id}
                    className={`relative bg-white rounded-lg border-2 p-6 ${
                      isCurrentPlan 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                          Current Plan
                        </span>
                      </div>
                    )}

                    {!isFree && (
                      <div className="absolute -top-3 -right-3">
                        <SparklesIcon className="h-6 w-6 text-yellow-500" />
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price_monthly}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      {plan.price_yearly > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          or ${plan.price_yearly}/year (save ${((plan.price_monthly * 12) - plan.price_yearly).toFixed(2)})
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">
                          {plan.limits.preorder_orders_per_month === 999999 
                            ? 'Unlimited preorder orders' 
                            : `${plan.limits.preorder_orders_per_month} preorder orders/month`}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">
                          {plan.limits.restock_emails_per_month === 999999 
                            ? 'Unlimited restock emails' 
                            : `${plan.limits.restock_emails_per_month} restock emails/month`}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {plan.limits.partial_payments ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-3" />
                        )}
                        <span className={`text-sm ${plan.limits.partial_payments ? 'text-gray-700' : 'text-gray-400'}`}>
                          Partial payments
                        </span>
                      </div>

                      <div className="flex items-center">
                        {plan.limits.discount_codes ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-3" />
                        )}
                        <span className={`text-sm ${plan.limits.discount_codes ? 'text-gray-700' : 'text-gray-400'}`}>
                          Discount codes
                        </span>
                      </div>

                      <div className="flex items-center">
                        {plan.limits.email_template_editing ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-3" />
                        )}
                        <span className={`text-sm ${plan.limits.email_template_editing ? 'text-gray-700' : 'text-gray-400'}`}>
                          Edit email templates
                        </span>
                      </div>

                      <div className="flex items-center">
                        {plan.limits.remove_branding ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-3" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-3" />
                        )}
                        <span className={`text-sm ${plan.limits.remove_branding ? 'text-gray-700' : 'text-gray-400'}`}>
                          Remove branding
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2">
                      {!isCurrentPlan && (
                        <button
                          onClick={() => handlePlanChange(plan.id, 'monthly')}
                          disabled={upgrading}
                          className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                            isFree
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {upgrading ? 'Updating...' : isFree ? 'Downgrade to Free' : 'Upgrade to Pro'}
                        </button>
                      )}
                      
                      {isCurrentPlan && !isFree && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Current plan</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Billing Info */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Currency</p>
                  <p>All charges are billed in USD</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Billing Cycle</p>
                  <p>Recurring and usage-based charges are billed every 30 days</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Trial</p>
                  <p>Each shop can try the free version with limited features</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cancellation</p>
                  <p>Cancel anytime. No long-term contracts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
