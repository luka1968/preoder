import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  preorders: {
    total: number
    thisMonth: number
    lastMonth: number
    revenue: number
    averageOrderValue: number
  }
  subscriptions: {
    total: number
    active: number
    notified: number
    conversionRate: number
  }
  emails: {
    sent: number
    pending: number
    failed: number
    deliveryRate: number
  }
  products: {
    totalWithPreorder: number
    mostPopular: Array<{
      id: string
      title: string
      preorders: number
      revenue: number
    }>
  }
  trends: {
    preordersByDay: Array<{
      date: string
      count: number
      revenue: number
    }>
    subscriptionsByDay: Array<{
      date: string
      count: number
    }>
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { shop } = router.query
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (shop) {
      fetchAnalytics()
    }
  }, [shop, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?shop=${shop}&range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getChangeIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    } else if (current < previous) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getChangeColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-500'
  }

  if (loading) {
    return (
      <Layout title="Analytics - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!analytics) {
    return (
      <Layout title="Analytics - PreOrder Pro" shop={shop as string}>
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics data will appear here once you have some pre-orders and activity.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Analytics - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Track your pre-order performance and customer engagement</p>
          </div>
          <div className="flex space-x-2">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === option.value
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Pre-orders
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {analytics.preorders.total}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor(analytics.preorders.thisMonth, analytics.preorders.lastMonth)
                    }`}>
                    {getChangeIcon(analytics.preorders.thisMonth, analytics.preorders.lastMonth)}
                    <span className="sr-only">
                      {analytics.preorders.thisMonth > analytics.preorders.lastMonth ? 'Increased' : 'Decreased'} by
                    </span>
                    {Math.abs(analytics.preorders.thisMonth - analytics.preorders.lastMonth)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pre-order Revenue
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(analytics.preorders.revenue)}
                  </div>
                </dd>
                <dd className="text-sm text-gray-500">
                  Avg: {formatCurrency(analytics.preorders.averageOrderValue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Subscriptions
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {analytics.subscriptions.active}
                  </div>
                </dd>
                <dd className="text-sm text-gray-500">
                  {formatPercentage(analytics.subscriptions.conversionRate)} conversion
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Email Delivery Rate
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatPercentage(analytics.emails.deliveryRate)}
                  </div>
                </dd>
                <dd className="text-sm text-gray-500">
                  {analytics.emails.sent} sent, {analytics.emails.failed} failed
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pre-orders Trend */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pre-orders Trend</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.trends.preordersByDay.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${Math.max((day.count / Math.max(...analytics.trends.preordersByDay.map(d => d.count))) * 200, 4)}px`
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Pre-order Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.products.mostPopular.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.preorders} pre-orders
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pre-order Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pre-order Details</h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Total Orders</dt>
                <dd className="text-sm font-medium text-gray-900">{analytics.preorders.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">This Month</dt>
                <dd className="text-sm font-medium text-gray-900">{analytics.preorders.thisMonth}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Last Month</dt>
                <dd className="text-sm font-medium text-gray-900">{analytics.preorders.lastMonth}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Average Order Value</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(analytics.preorders.averageOrderValue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Products with Pre-order</dt>
                <dd className="text-sm font-medium text-gray-900">{analytics.products.totalWithPreorder}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Total Subscriptions</dt>
                <dd className="text-sm font-medium text-gray-900">{analytics.subscriptions.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Active</dt>
                <dd className="text-sm font-medium text-green-600">{analytics.subscriptions.active}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Notified</dt>
                <dd className="text-sm font-medium text-blue-600">{analytics.subscriptions.notified}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Conversion Rate</dt>
                <dd className="text-sm font-medium text-gray-900">{formatPercentage(analytics.subscriptions.conversionRate)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Email Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Email Details</h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Emails Sent</dt>
                <dd className="text-sm font-medium text-green-600">{analytics.emails.sent}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Pending</dt>
                <dd className="text-sm font-medium text-yellow-600">{analytics.emails.pending}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Failed</dt>
                <dd className="text-sm font-medium text-red-600">{analytics.emails.failed}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Delivery Rate</dt>
                <dd className="text-sm font-medium text-gray-900">{formatPercentage(analytics.emails.deliveryRate)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  )
}
