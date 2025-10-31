import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 测试连接
    console.log('🔍 测试 Supabase 连接...')
    
    // 1. 测试查询 shops 表
    const { data: shopsData, error: shopsError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .limit(1)

    if (shopsError) {
      return res.status(500).json({
        success: false,
        error: 'shops 表查询失败',
        details: shopsError.message,
        code: shopsError.code,
        hint: shopsError.hint
      })
    }

    // 2. 测试插入数据
    const testShop = {
      shop_domain: 'test-' + Date.now() + '.myshopify.com',
      access_token: 'test_token_' + Date.now(),
      scope: 'read_products,write_products',
      plan: 'free',
      active: true
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('shops')
      .insert([testShop])
      .select()

    if (insertError) {
      return res.status(500).json({
        success: false,
        error: '插入测试数据失败',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint,
        testData: testShop
      })
    }

    // 3. 删除测试数据
    await supabaseAdmin
      .from('shops')
      .delete()
      .eq('shop_domain', testShop.shop_domain)

    return res.status(200).json({
      success: true,
      message: '✅ Supabase 连接正常',
      shops_count: shopsData?.length || 0,
      test_insert: '成功',
      env_check: {
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: '测试失败',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
