import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain } from '../../../lib/supabase'
import { sendTestEmail, validateEmailConfig } from '../../../lib/brevo-email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { shop, email } = req.body

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    // Validate email configuration
    if (!validateEmailConfig()) {
      return res.status(500).json({ 
        error: 'Email configuration is incomplete. Please check your SMTP settings.' 
      })
    }

    // Send test email
    const success = await sendTestEmail(email, shopData.name || shop)

    if (success) {
      res.json({ 
        success: true, 
        message: `Test email sent successfully to ${email}` 
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to send test email. Please check your email configuration.' 
      })
    }

  } catch (error) {
    console.error('Test email API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
