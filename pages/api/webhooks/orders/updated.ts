import { NextApiRequest, NextApiResponse } from 'next'
import { handleOrderUpdate, verifyShopifyWebhook } from '../../../../lib/webhooks'
import { OrderUpdateWebhook } from '../../../../types'

import { getRawBodyFromRequest } from '../../../../lib/raw-body'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get raw body for verification
    const rawBody = await getRawBodyFromRequest(req)
    const rawBodyString = rawBody.toString('utf8')

    // Verify webhook signature
    if (!verifyShopifyWebhook(req, rawBodyString)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = JSON.parse(rawBodyString) as OrderUpdateWebhook

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    // Handle the order update
    await handleOrderUpdate(payload, shop)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Order update webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
