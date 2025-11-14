import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取所有预购记录
    const { data, error } = await supabaseAdmin
      .from('preorder_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('获取预购列表失败:', error);
      return res.status(500).json({ 
        error: '获取预购列表失败',
        details: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      preorders: data || [],
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('预购列表API错误:', error);
    return res.status(500).json({
      error: '服务器错误',
      details: error.message
    });
  }
}
