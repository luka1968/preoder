import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { 
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface PreorderOrder {
  id: string
  shopify_order_id: string
  product_id: string
  variant_id?: string
  customer_email: string
  total_amount: string
  paid_amount: string
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  fulfillment_status: 'pending' | 'fulfilled' | 'cancelled'
  estimated_delivery_date?: string
  order_tags: string[]
  created_at: string
  updated_at: string
  product_title?: string
  variant_title?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { shop } = router.query
  const [orders, setOrders] = useState<PreorderOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'fulfilled'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'partial' | 'paid' | 'refunded'>('all')

  useEffect(() => {
    if (shop) {
      fetchOrders()
    }
  }, [shop])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.shopify_order_id.includes(searchQuery)
    
    if (!matchesSearch) return false

    if (statusFilter !== 'all' && order.fulfillment_status !== statusFilter) return false
    if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) return false

    return true
  })

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success">Paid</span>
      case 'partial':
        return <span className="badge badge-warning">Partial</span>
      case 'pending':
        return <span className="badge badge-gray">Pending</span>
      case 'refunded':
        return <span className="badge badge-error">Refunded</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  const getFulfillmentStatusBadge = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return <span className="badge badge-success">Fulfilled</span>
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      case 'cancelled':
        return <span className="badge badge-error">Cancelled</span>
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Layout title="Pre-orders - PreOrder Pro" shop={shop as string}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Pre-orders - PreOrder Pro" shop={shop as string}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pre-order Orders</h1>
        <p className="text-gray-600">Manage and track all pre-order orders</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, product, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="form-select"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Orders', 
            value: orders.length, 
            icon: ShoppingCartIcon,
            color: 'bg-blue-500' 
          },
          { 
            label: 'Pending Payment', 
            value: orders.filter(o => o.payment_status === 'pending').length, 
            icon: CurrencyDollarIcon,
            color: 'bg-yellow-500' 
          },
          { 
            label: 'Pending Fulfillment', 
            value: orders.filter(o => o.fulfillment_status === 'pending').length, 
            icon: TruckIcon,
            color: 'bg-orange-500' 
          },
          { 
            label: 'Fulfilled', 
            value: orders.filter(o => o.fulfillment_status === 'fulfilled').length, 
            icon: CheckCircleIcon,
            color: 'bg-green-500' 
          }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stat.color} mr-3`}></div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try adjusting your search terms.' : 'No pre-orders have been placed yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfillment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.shopify_order_id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.product_title || `Product ${order.product_id}`}
                        </div>
                        {order.variant_title && (
                          <div className="text-sm text-gray-500">
                            {order.variant_title}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                        {order.paid_amount !== order.total_amount && (
                          <div className="text-sm text-gray-500">
                            Paid: {formatCurrency(order.paid_amount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getFulfillmentStatusBadge(order.fulfillment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.estimated_delivery_date ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(order.estimated_delivery_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`https://${shop}/admin/orders/${order.shopify_order_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View in Shopify
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}
