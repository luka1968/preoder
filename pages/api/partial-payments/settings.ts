import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'GET') {
      // Get partial payment settings
      const { data: settings, error } = await supabaseAdmin
        .from('partial_payment_settings')
        .select('*')
        .eq('shop_id', shopData.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching partial payment settings:', error)
        return res.status(500).json({ error: 'Failed to fetch settings' })
      }

      res.json({ settings: settings || null })

    } else if (req.method === 'PUT') {
      // Create or update partial payment settings
      const {
        enabled,
        default_percentage,
        minimum_deposit,
        maximum_deposit,
        payment_terms_days,
        auto_charge_remaining,
        send_payment_reminders,
        reminder_days_before,
        late_fee_enabled,
        late_fee_percentage,
        grace_period_days
      } = req.body

      const settingsData = {
        shop_id: shopData.id,
        enabled: enabled || false,
        default_percentage: default_percentage || 50,
        minimum_deposit: minimum_deposit || 25,
        maximum_deposit: maximum_deposit || 75,
        payment_terms_days: payment_terms_days || 30,
        auto_charge_remaining: auto_charge_remaining || false,
        send_payment_reminders: send_payment_reminders !== false,
        reminder_days_before: reminder_days_before || [7, 3, 1],
        late_fee_enabled: late_fee_enabled || false,
        late_fee_percentage: late_fee_percentage || 5,
        grace_period_days: grace_period_days || 3,
        updated_at: new Date().toISOString()
      }

      const { data: settings, error } = await supabaseAdmin
        .from('partial_payment_settings')
        .upsert(settingsData, {
          onConflict: 'shop_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving partial payment settings:', error)
        return res.status(500).json({ error: 'Failed to save settings' })
      }

      res.json({ success: true, settings })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Partial payment settings API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
