import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop } = req.query

    if (!shop || typeof shop !== 'string') {
      return res.status(400).json({ error: 'Shop parameter is required' })
    }

    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    const activities = []

    // Get recent preorder orders
    const { data: recentOrders, error: ordersError } = await supabaseAdmin
      .from('preorder_orders')
      .select('*')
      .eq('shop_id', shopData.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!ordersError && recentOrders) {
      recentOrders.forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'preorder',
          message: `New pre-order received for $${order.total_amount}`,
          timestamp: formatTimestamp(order.created_at)
        })
      })
    }

    // Get recent subscriptions
    const { data: recentSubscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('back_in_stock_subscriptions')
      .select('*')
      .eq('shop_id', shopData.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!subscriptionsError && recentSubscriptions) {
      recentSubscriptions.forEach(subscription => {
        activities.push({
          id: `subscription-${subscription.id}`,
          type: 'notification',
          message: `${subscription.customer_email} subscribed to back-in-stock notifications`,
          timestamp: formatTimestamp(subscription.created_at)
        })
      })
    }

    // Get recent notifications sent
    const { data: recentNotifications, error: notificationsError } = await supabaseAdmin
      .from('notification_queue')
      .select('*')
      .eq('shop_id', shopData.id)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(10)

    if (!notificationsError && recentNotifications) {
      recentNotifications.forEach(notification => {
        let message = ''
        switch (notification.template_type) {
          case 'back_in_stock':
            message = `Back-in-stock notification sent to ${notification.recipient_email}`
            break
          case 'preorder_confirmation':
            message = `Pre-order confirmation sent to ${notification.recipient_email}`
            break
          case 'payment_reminder':
            message = `Payment reminder sent to ${notification.recipient_email}`
            break
          default:
            message = `Notification sent to ${notification.recipient_email}`
        }

        activities.push({
          id: `notification-${notification.id}`,
          type: 'notification',
          message,
          timestamp: formatTimestamp(notification.sent_at)
        })
      })
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp.replace(' ago', '')).getTime()
      const timeB = new Date(b.timestamp.replace(' ago', '')).getTime()
      return timeB - timeA
    })

    // Return top 20 activities
    res.json(activities.slice(0, 20))

  } catch (error) {
    console.error('Dashboard activity error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function formatTimestamp(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}
