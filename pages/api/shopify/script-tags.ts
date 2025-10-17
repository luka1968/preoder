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

    if (req.method === 'POST') {
      // 自动创建Script Tag - 当用户安装应用时调用
      await createScriptTag(shopData.access_token, shop)
      res.json({ success: true, message: 'Script tag created successfully' })
      
    } else if (req.method === 'DELETE') {
      // 删除Script Tag - 当用户卸载应用时调用
      await deleteScriptTag(shopData.access_token, shop)
      res.json({ success: true, message: 'Script tag deleted successfully' })
      
    } else if (req.method === 'GET') {
      // 检查Script Tag状态
      const scriptTags = await getScriptTags(shopData.access_token, shop)
      res.json({ scriptTags })
      
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Script Tags API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function createScriptTag(accessToken: string, shop: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'
  const scriptUrl = `${appUrl}/universal-preorder.js`
  
  const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script_tag: {
        event: 'onload',
        src: scriptUrl,
        display_scope: 'online_store'
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to create script tag:', error)
    throw new Error('Failed to create script tag')
  }

  const result = await response.json()
  console.log('Script tag created:', result)
  return result
}

async function deleteScriptTag(accessToken: string, shop: string) {
  // 首先获取所有script tags
  const scriptTags = await getScriptTags(accessToken, shop)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'
  
  // 找到我们的script tag
  const ourScriptTag = scriptTags.find((tag: any) => 
    tag.src.includes(appUrl) || tag.src.includes('universal-preorder.js')
  )

  if (ourScriptTag) {
    const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags/${ourScriptTag.id}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete script tag')
    }

    console.log('Script tag deleted:', ourScriptTag.id)
  }
}

async function getScriptTags(accessToken: string, shop: string) {
  const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get script tags')
  }

  const result = await response.json()
  return result.script_tags || []
}
