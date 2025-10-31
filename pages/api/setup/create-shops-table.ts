import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🔧 开始创建 shops 表...')

    // 创建 shops 表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS shops (
        id BIGSERIAL PRIMARY KEY,
        shop_domain TEXT UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        scope TEXT,
        installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        uninstalled_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      );
    `

    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createTableSQL 
    })

    // 如果 rpc 不可用，尝试直接创建
    if (tableError) {
      console.log('⚠️ RPC方法不可用，尝试直接插入测试数据验证表是否存在...')
      
      // 尝试查询表，如果不存在会报错
      const { error: checkError } = await supabaseAdmin
        .from('shops')
        .select('id')
        .limit(1)

      if (checkError) {
        return res.status(500).json({
          success: false,
          error: '无法创建表',
          message: '请手动在 Supabase SQL Editor 中运行 supabase-shops-table.sql 文件',
          details: checkError.message,
          sql: `
-- 请在 Supabase SQL Editor 中运行以下 SQL：

CREATE TABLE IF NOT EXISTS shops (
  id BIGSERIAL PRIMARY KEY,
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uninstalled_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);
          `
        })
      }

      return res.status(200).json({
        success: true,
        message: 'shops 表已存在',
        note: '如果是第一次运行，请确保表结构正确'
      })
    }

    console.log('✅ shops 表创建成功')

    // 创建索引
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);
      CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);
    `

    await supabaseAdmin.rpc('exec_sql', { sql: createIndexSQL })

    console.log('✅ 索引创建成功')

    return res.status(200).json({
      success: true,
      message: 'shops 表和索引创建成功！',
      next_steps: [
        '1. 访问 /install 页面',
        '2. 输入店铺域名',
        '3. 完成 OAuth 安装',
        '4. 测试预购功能'
      ]
    })

  } catch (error: any) {
    console.error('❌ 创建表错误:', error)
    return res.status(500).json({
      success: false,
      error: '创建表失败',
      message: '请手动在 Supabase SQL Editor 中运行 supabase-shops-table.sql 文件',
      details: error.message
    })
  }
}
