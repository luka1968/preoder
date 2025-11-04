import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop } = req.body

    if (!shop) {
      return res.status(400).json({ error: '请提供店铺域名' })
    }

    console.log('🔍 检查店铺:', shop)

    // 从数据库查询店铺信息
    const { data: shopData, error: dbError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (dbError) {
      console.error('❌ 数据库查询错误:', dbError)
      
      if (dbError.code === 'PGRST116') {
        // 没有找到记录
        return res.status(200).json({
          hasToken: false,
          shop: null,
          message: '店铺未在数据库中找到，需要安装应用'
        })
      }
      
      return res.status(500).json({ 
        error: '数据库查询失败',
        details: dbError.message 
      })
    }

    if (!shopData) {
      return res.status(200).json({
        hasToken: false,
        shop: null,
        message: '店铺未找到'
      })
    }

    console.log('✅ 找到店铺记录')

    const hasToken = !!shopData.access_token
    const tokenLength = shopData.access_token?.length || 0

    // 测试 token 是否有效（可选）
    let tokenValid = undefined
    let apiTest = undefined

    if (hasToken) {
      try {
        console.log('🧪 测试 Access Token 有效性...')
        
        // 调用 Shopify API 测试 token
        const testResponse = await fetch(
          `https://${shop}/admin/api/2023-10/shop.json`,
          {
            headers: {
              'X-Shopify-Access-Token': shopData.access_token,
            }
          }
        )

        tokenValid = testResponse.ok
        
        if (testResponse.ok) {
          const shopInfo = await testResponse.json()
          apiTest = `✅ API 调用成功 - 店铺名称: ${shopInfo.shop?.name || '未知'}`
          console.log('✅ Token 有效')
        } else {
          const errorText = await testResponse.text()
          apiTest = `❌ API 调用失败 (${testResponse.status}): ${errorText.substring(0, 100)}`
          console.error('❌ Token 无效:', errorText)
        }
      } catch (error: any) {
        console.error('❌ Token 测试异常:', error)
        apiTest = `❌ 测试异常: ${error.message}`
        tokenValid = false
      }
    }

    // 返回结果（不包含完整的 access_token）
    return res.status(200).json({
      hasToken,
      tokenLength,
      tokenValid,
      apiTest,
      shop: {
        shop_domain: shopData.shop_domain,
        scope: shopData.scope,
        plan: shopData.plan,
        active: shopData.active,
        created_at: shopData.created_at,
        updated_at: shopData.updated_at
      }
    })

  } catch (error: any) {
    console.error('❌ 检查 token 错误:', error)
    return res.status(500).json({ 
      error: '服务器错误',
      details: error.message 
    })
  }
}
