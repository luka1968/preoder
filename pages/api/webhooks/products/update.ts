import { NextApiRequest, NextApiResponse } from 'next'
import { handleProductUpdate, verifyShopifyWebhook } from '../../../../lib/webhooks'
import { ProductUpdateWebhook } from '../../../../types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify webhook signature
    if (!verifyShopifyWebhook(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = req.body as ProductUpdateWebhook

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    // Handle the product update
    await handleProductUpdate(payload, shop)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Product update webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
