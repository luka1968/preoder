import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { shop, range = '30d' } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    // Calculate date ranges
    const now = new Date()
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    const lastPeriodStart = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get pre-order statistics
    const preorderStats = await getPreorderStats(shopData.id, startDate, lastPeriodStart)
    
    // Get subscription statistics
    const subscriptionStats = await getSubscriptionStats(shopData.id, startDate)
    
    // Get email statistics
    const emailStats = await getEmailStats(shopData.id, startDate)
    
    // Get product statistics
    const productStats = await getProductStats(shopData.id, startDate)
    
    // Get trend data
    const trends = await getTrendData(shopData.id, startDate, daysBack)

    const analytics = {
      preorders: preorderStats,
      subscriptions: subscriptionStats,
      emails: emailStats,
      products: productStats,
      trends
    }

    res.json({ success: true, analytics })

  } catch (error) {
    console.error('Analytics API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function getPreorderStats(shopId: string, startDate: Date, lastPeriodStart: Date) {
  // Get current period pre-orders
  const { data: currentOrders, error: currentError } = await supabaseAdmin
    .from('preorder_orders')
    .select('total_amount, created_at')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())

  if (currentError) {
    console.error('Error fetching current preorders:', currentError)
  }

  // Get last period pre-orders for comparison
  const { data: lastPeriodOrders, error: lastError } = await supabaseAdmin
    .from('preorder_orders')
    .select('total_amount, created_at')
    .eq('shop_id', shopId)
    .gte('created_at', lastPeriodStart.toISOString())
    .lt('created_at', startDate.toISOString())

  if (lastError) {
    console.error('Error fetching last period preorders:', lastError)
  }

  // Get all-time total
  const { data: allOrders, error: allError } = await supabaseAdmin
    .from('preorder_orders')
    .select('total_amount')
    .eq('shop_id', shopId)

  if (allError) {
    console.error('Error fetching all preorders:', allError)
  }

  const currentCount = currentOrders?.length || 0
  const lastPeriodCount = lastPeriodOrders?.length || 0
  const totalCount = allOrders?.length || 0
  
  const currentRevenue = currentOrders?.reduce((sum, order) => 
    sum + parseFloat(order.total_amount || '0'), 0) || 0
  
  const totalRevenue = allOrders?.reduce((sum, order) => 
    sum + parseFloat(order.total_amount || '0'), 0) || 0

  return {
    total: totalCount,
    thisMonth: currentCount,
    lastMonth: lastPeriodCount,
    revenue: totalRevenue,
    averageOrderValue: totalCount > 0 ? totalRevenue / totalCount : 0
  }
}

async function getSubscriptionStats(shopId: string, startDate: Date) {
  // Get subscription counts by status
  const { data: subscriptions, error } = await supabaseAdmin
    .from('back_in_stock_subscriptions')
    .select('status, created_at')
    .eq('shop_id', shopId)

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return {
      total: 0,
      active: 0,
      notified: 0,
      conversionRate: 0
    }
  }

  const total = subscriptions?.length || 0
  const active = subscriptions?.filter(s => s.status === 'active').length || 0
  const notified = subscriptions?.filter(s => s.status === 'notified').length || 0
  
  // Calculate conversion rate (notified / total)
  const conversionRate = total > 0 ? notified / total : 0

  return {
    total,
    active,
    notified,
    conversionRate
  }
}

async function getEmailStats(shopId: string, startDate: Date) {
  // Get email statistics from notification queue
  const { data: emails, error } = await supabaseAdmin
    .from('notification_queue')
    .select('status, created_at')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Error fetching email stats:', error)
    return {
      sent: 0,
      pending: 0,
      failed: 0,
      deliveryRate: 0
    }
  }

  const sent = emails?.filter(e => e.status === 'sent').length || 0
  const pending = emails?.filter(e => e.status === 'pending').length || 0
  const failed = emails?.filter(e => e.status === 'failed').length || 0
  const total = emails?.length || 0
  
  const deliveryRate = total > 0 ? sent / total : 0

  return {
    sent,
    pending,
    failed,
    deliveryRate
  }
}

async function getProductStats(shopId: string, startDate: Date) {
  // Get products with pre-order configurations
  const { data: productConfigs, error: configError } = await supabaseAdmin
    .from('product_preorder_configs')
    .select('product_id, enabled')
    .eq('shop_id', shopId)
    .eq('enabled', true)

  if (configError) {
    console.error('Error fetching product configs:', configError)
  }

  // Get pre-order statistics by product
  const { data: ordersByProduct, error: ordersError } = await supabaseAdmin
    .from('preorder_orders')
    .select('product_id, total_amount')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())

  if (ordersError) {
    console.error('Error fetching orders by product:', ordersError)
  }

  // Group orders by product
  const productStats = new Map()
  ordersByProduct?.forEach(order => {
    const productId = order.product_id
    if (!productStats.has(productId)) {
      productStats.set(productId, {
        id: productId,
        title: `Product ${productId}`, // Would need to fetch from Shopify API
        preorders: 0,
        revenue: 0
      })
    }
    const stats = productStats.get(productId)
    stats.preorders += 1
    stats.revenue += parseFloat(order.total_amount || '0')
  })

  // Convert to array and sort by revenue
  const mostPopular = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)

  return {
    totalWithPreorder: productConfigs?.length || 0,
    mostPopular
  }
}

async function getTrendData(shopId: string, startDate: Date, daysBack: number) {
  // Generate date range for trends
  const dates = []
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
    dates.push(date.toISOString().split('T')[0])
  }

  // Get pre-orders by day
  const { data: preorders, error: preorderError } = await supabaseAdmin
    .from('preorder_orders')
    .select('created_at, total_amount')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())

  if (preorderError) {
    console.error('Error fetching preorder trends:', preorderError)
  }

  // Get subscriptions by day
  const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
    .from('back_in_stock_subscriptions')
    .select('created_at')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())

  if (subscriptionError) {
    console.error('Error fetching subscription trends:', subscriptionError)
  }

  // Group by date
  const preordersByDay = dates.map(date => {
    const dayOrders = preorders?.filter(order => 
      order.created_at.startsWith(date)
    ) || []
    
    return {
      date,
      count: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || '0'), 0)
    }
  })

  const subscriptionsByDay = dates.map(date => {
    const daySubs = subscriptions?.filter(sub => 
      sub.created_at.startsWith(date)
    ) || []
    
    return {
      date,
      count: daySubs.length
    }
  })

  return {
    preordersByDay,
    subscriptionsByDay
  }
}
