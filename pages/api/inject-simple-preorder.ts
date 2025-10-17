import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain } from '../../lib/supabase'

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
      // 注入简单预购脚本
      const result = await injectSimplePreorderScript(shopData.access_token, shop)
      res.json(result)
      
    } else if (req.method === 'DELETE') {
      // 删除脚本
      const result = await removePreorderScripts(shopData.access_token, shop)
      res.json(result)
      
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Simple Preorder Injection error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function injectSimplePreorderScript(accessToken: string, shop: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'
  const scriptUrl = `${appUrl}/simple-preorder-inject.js`
  
  try {
    // 首先删除现有的预购脚本
    await removePreorderScripts(accessToken, shop)
    
    // 创建新的简单预购脚本
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
      throw new Error(`Failed to create script tag: ${error}`)
    }

    const result = await response.json()
    console.log('✅ Simple PreOrder script tag created:', result.script_tag.id)
    
    return {
      success: true,
      message: 'Simple PreOrder script injected successfully',
      scriptId: result.script_tag.id,
      scriptUrl: scriptUrl
    }

  } catch (error) {
    console.error('Error injecting simple preorder script:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function removePreorderScripts(accessToken: string, shop: string) {
  try {
    // 获取所有script tags
    const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get script tags')
    }

    const result = await response.json()
    const scriptTags = result.script_tags || []

    // 找到所有预购相关的脚本
    const preorderScripts = scriptTags.filter((tag: any) => 
      tag.src.includes('preorder') || 
      tag.src.includes('universal') ||
      tag.src.includes('simple-preorder')
    )

    console.log(`Found ${preorderScripts.length} preorder scripts to remove`)

    // 删除所有预购脚本
    const deletePromises = preorderScripts.map(async (script: any) => {
      const deleteResponse = await fetch(`https://${shop}/admin/api/2023-10/script_tags/${script.id}.json`, {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': accessToken,
        }
      })

      if (deleteResponse.ok) {
        console.log('✅ Deleted script tag:', script.id)
        return { success: true, id: script.id }
      } else {
        console.error('❌ Failed to delete script tag:', script.id)
        return { success: false, id: script.id }
      }
    })

    const deleteResults = await Promise.all(deletePromises)
    
    return {
      success: true,
      message: `Removed ${preorderScripts.length} preorder scripts`,
      deletedScripts: deleteResults
    }

  } catch (error) {
    console.error('Error removing preorder scripts:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
