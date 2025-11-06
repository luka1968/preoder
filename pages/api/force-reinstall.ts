import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 1. 删除数据库中的记录，强制重新安装
    const { error: deleteError } = await supabaseAdmin
      .from('shops')
      .delete()
      .eq('shop_domain', shop)

    if (deleteError) {
      console.error('删除记录失败:', deleteError)
      // 即使删除失败也继续，可能记录不存在
    }

    // 2. 构建 OAuth URL，强制重新授权
    const apiKey = process.env.SHOPIFY_API_KEY
    const scopes = process.env.SHOPIFY_SCOPES
    const appUrl = process.env.SHOPIFY_APP_URL
    const redirectUri = `${appUrl}/api/auth/shopify`
    
    // 使用时间戳作为 state，确保是全新的授权请求
    const state = `reinstall_${Date.now()}`
    
    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${apiKey}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `grant_options[]=per-user` // 强制显示授权页面

    console.log('🔄 强制重新安装，跳转到:', authUrl)
    
    return res.redirect(authUrl)

  } catch (error: any) {
    console.error('强制重新安装错误:', error)
    return res.status(500).json({
      error: '操作失败',
      message: error.message
    })
  }
}
