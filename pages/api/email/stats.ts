import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    // Get email statistics from notification queue
    const { data: stats, error } = await supabaseAdmin
      .from('notification_queue')
      .select('status')
      .eq('shop_id', shopData.id)

    if (error) {
      console.error('Error fetching email stats:', error)
      return res.status(500).json({ error: 'Failed to fetch email statistics' })
    }

    // Calculate statistics
    const emailStats = {
      total: stats?.length || 0,
      sent: stats?.filter(s => s.status === 'sent').length || 0,
      pending: stats?.filter(s => s.status === 'pending').length || 0,
      failed: stats?.filter(s => s.status === 'failed').length || 0,
      retries: stats?.filter(s => s.status === 'pending' && s.retry_count > 0).length || 0
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabaseAdmin
      .from('notification_queue')
      .select('*')
      .eq('shop_id', shopData.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activityError) {
      console.error('Error fetching recent activity:', activityError)
    }

    res.json({
      success: true,
      stats: emailStats,
      recent_activity: recentActivity || []
    })

  } catch (error) {
    console.error('Email stats API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
