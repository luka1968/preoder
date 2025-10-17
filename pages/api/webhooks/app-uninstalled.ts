import { NextApiRequest, NextApiResponse } from 'next'
import { verifyWebhookSignature } from '../../../lib/shopify'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 验证webhook签名
    const isValid = verifyWebhookSignature(req.body, req.headers)
    if (!isValid) {
      console.error('Invalid webhook signature for app uninstall')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    console.log('🗑️ App uninstalled for shop:', shop)

    // 获取商店的access token
    const { data: shopData } = await supabaseAdmin
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shop)
      .single()

    if (shopData?.access_token) {
      // 自动删除我们注入的script tag
      try {
        await autoRemovePreorderScript(shop, shopData.access_token)
        console.log('✅ PreOrder script auto-removed for:', shop)
      } catch (error) {
        console.warn('⚠️ Failed to auto-remove PreOrder script for:', shop, error)
      }
    }

    // 删除商店数据（可选，根据需求决定）
    await supabaseAdmin
      .from('shops')
      .delete()
      .eq('shop_domain', shop)

    console.log('✅ Shop data cleaned up for:', shop)
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
