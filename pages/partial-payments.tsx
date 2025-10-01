import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Switch } from '@headlessui/react'
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface PartialPaymentSettings {
  id?: string
  shop_id: string
  enabled: boolean
  default_percentage: number
  minimum_deposit: number
  maximum_deposit: number
  payment_terms_days: number
  auto_charge_remaining: boolean
  send_payment_reminders: boolean
  reminder_days_before: number[]
  late_fee_enabled: boolean
  late_fee_percentage: number
  grace_period_days: number
}

interface PartialPayment {
  id: string
  order_id: string
  customer_email: string
  total_amount: string
  deposit_amount: string
  remaining_amount: string
  deposit_paid: boolean
  remaining_paid: boolean
  due_date: string
  payment_status: 'pending_deposit' | 'deposit_paid' | 'completed' | 'overdue'
  created_at: string
  product_title?: string
}

export default function PartialPaymentsPage() {
  const router = useRouter()
  const { shop } = router.query
  const [settings, setSettings] = useState<PartialPaymentSettings>({
    shop_id: '',
    enabled: false,
    default_percentage: 50,
    minimum_deposit: 25,
    maximum_deposit: 75,
    payment_terms_days: 30,
    auto_charge_remaining: false,
    send_payment_reminders: true,
    reminder_days_before: [7, 3, 1],
    late_fee_enabled: false,
    late_fee_percentage: 5,
    grace_period_days: 3
  })
  const [payments, setPayments] = useState<PartialPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (shop) {
      fetchSettings()
      fetchPayments()
    }
  }, [shop])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/partial-payments/settings?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/partial-payments?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/partial-payments/settings?shop=${shop}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'deposit_paid':
        return <span className="badge badge-info">Deposit Paid</span>
      case 'pending_deposit':
        return <span className="badge badge-warning">Pending Deposit</span>
      case 'overdue':
        return <span className="badge badge-error">Overdue</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount || '0'))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout title="Partial Payments - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Partial Payments - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Partial Payments</h1>
        <p className="text-gray-600">Configure deposit payments for pre-orders</p>
      </div>

      {message && (
        <div className={`mb-6 rounded-md p-4 ${
          message.type === 'success' ? 'bg-success-50 text-success-800' : 'bg-error-50 text-error-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckIcon className="h-5 w-5 text-success-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-error-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Enable Partial Payments */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base font-medium text-gray-900">
                  Enable Partial Payments
                </label>
                <p className="text-sm text-gray-500">
                  Allow customers to pay deposits for pre-orders
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onChange={(checked) => setSettings({ ...settings, enabled: checked })}
                className={`${
                  settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </div>

            {settings.enabled && (
              <>
                {/* Default Deposit Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Default Deposit Percentage
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="range"
                      min={settings.minimum_deposit}
                      max={settings.maximum_deposit}
                      value={settings.default_percentage}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        default_percentage: parseInt(e.target.value) 
                      })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {settings.default_percentage}%
                    </span>
                  </div>
                </div>

                {/* Deposit Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Deposit %
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={settings.minimum_deposit}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        minimum_deposit: parseInt(e.target.value) || 1 
                      })}
                      className="mt-1 form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Deposit %
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={settings.maximum_deposit}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        maximum_deposit: parseInt(e.target.value) || 99 
                      })}
                      className="mt-1 form-input"
                    />
                  </div>
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Terms (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.payment_terms_days}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      payment_terms_days: parseInt(e.target.value) || 30 
                    })}
                    className="mt-1 form-input"
                    placeholder="30"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Days until remaining balance is due
                  </p>
                </div>

                {/* Auto Charge */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Auto-charge Remaining Balance
                    </label>
                    <p className="text-sm text-gray-500">
                      Automatically charge remaining amount when due
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_charge_remaining}
                    onChange={(checked) => setSettings({ ...settings, auto_charge_remaining: checked })}
                    className={`${
                      settings.auto_charge_remaining ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.auto_charge_remaining ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </Switch>
                </div>

                {/* Payment Reminders */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Send Payment Reminders
                    </label>
                    <p className="text-sm text-gray-500">
                      Email reminders before payment due date
                    </p>
                  </div>
                  <Switch
                    checked={settings.send_payment_reminders}
                    onChange={(checked) => setSettings({ ...settings, send_payment_reminders: checked })}
                    className={`${
                      settings.send_payment_reminders ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.send_payment_reminders ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </Switch>
                </div>

                {/* Late Fees */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Enable Late Fees
                    </label>
                    <p className="text-sm text-gray-500">
                      Charge late fees for overdue payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.late_fee_enabled}
                    onChange={(checked) => setSettings({ ...settings, late_fee_enabled: checked })}
                    className={`${
                      settings.late_fee_enabled ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.late_fee_enabled ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </Switch>
                </div>

                {settings.late_fee_enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Late Fee %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        value={settings.late_fee_percentage}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          late_fee_percentage: parseFloat(e.target.value) || 0 
                        })}
                        className="mt-1 form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Grace Period (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={settings.grace_period_days}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          grace_period_days: parseInt(e.target.value) || 0 
                        })}
                        className="mt-1 form-input"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full btn-primary"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Partial Payments</h2>
          </div>
          <div className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No partial payments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Partial payments will appear here once customers start using this feature.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {payment.product_title || `Order ${payment.order_id.slice(-6)}`}
                          </h4>
                          {getPaymentStatusBadge(payment.payment_status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {payment.customer_email}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>
                            Total: {formatCurrency(payment.total_amount)}
                          </span>
                          <span>
                            Deposit: {formatCurrency(payment.deposit_amount)}
                          </span>
                          <span>
                            Remaining: {formatCurrency(payment.remaining_amount)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Due: {formatDate(payment.due_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length > 5 && (
                  <div className="text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-500">
                      View all payments
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {payments.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Partial Payments', 
              value: payments.length, 
              icon: CreditCardIcon,
              color: 'text-blue-600' 
            },
            { 
              label: 'Pending Deposits', 
              value: payments.filter(p => p.payment_status === 'pending_deposit').length, 
              icon: ClockIcon,
              color: 'text-yellow-600' 
            },
            { 
              label: 'Completed', 
              value: payments.filter(p => p.payment_status === 'completed').length, 
              icon: CheckIcon,
              color: 'text-green-600' 
            },
            { 
              label: 'Overdue', 
              value: payments.filter(p => p.payment_status === 'overdue').length, 
              icon: ExclamationTriangleIcon,
              color: 'text-red-600' 
            }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.label}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
