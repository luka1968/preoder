import { NextApiRequest, NextApiResponse } from 'next'
import { getRawBodyFromRequest } from '../../../lib/raw-body'
import { handleAppUninstalled, verifyShopifyWebhook } from '../../../lib/webhooks'
import { AppUninstalledWebhook } from '../../../types'

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
    const payload = JSON.parse(rawBodyString) as AppUninstalledWebhook

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    // Handle the app uninstalled event using the centralized handler
    await handleAppUninstalled(payload, shop)

    // Additional cleanup if needed (script tag removal logic can be moved to handleAppUninstalled if not already there)
    // For now, we'll keep the centralized handler logic which marks shop as inactive

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('App uninstall webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 自动删除预购脚本
async function autoRemovePreorderScript(shopDomain: string, accessToken: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'

  // 获取所有script tags
  const response = await fetch(`https://${shopDomain}/admin/api/2023-10/script_tags.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get script tags')
  }

  const result = await response.json()
  const scriptTags = result.script_tags || []

  // 找到我们的script tag
  const ourScriptTag = scriptTags.find((tag: any) =>
    tag.src.includes(appUrl) || tag.src.includes('universal-preorder.js')
  )

  if (ourScriptTag) {
    // 删除script tag
    const deleteResponse = await fetch(`https://${shopDomain}/admin/api/2023-10/script_tags/${ourScriptTag.id}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete script tag')
    }

    console.log('✅ PreOrder script tag deleted:', ourScriptTag.id)
  } else {
    console.log('ℹ️ No PreOrder script tag found to delete')
  }
}
