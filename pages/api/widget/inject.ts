import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // 生成自动注入脚本
    const injectionScript = `
(function() {
  'use strict';
  
  console.log('🚀 PreOrder Pro Auto-Injection Starting...');
  
  // 检查是否已经加载
  if (window.PreOrderProLoaded) {
    console.log('✅ PreOrder Pro already loaded');
    return;
  }
  
  // 标记为已加载
  window.PreOrderProLoaded = true;
  
  // 设置配置
  window.PREORDER_CONFIG = {
    shop: '${shop}',
    apiUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'}/api',
    debug: true
  };
  
  // 动态加载通用预购脚本
  const script = document.createElement('script');
  script.src = '${process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'}/universal-preorder.js';
  script.async = true;
  script.onload = function() {
    console.log('✅ Universal PreOrder Widget loaded successfully');
  };
  script.onerror = function() {
    console.error('❌ Failed to load Universal PreOrder Widget');
  };
  
  document.head.appendChild(script);
  
  console.log('🎯 PreOrder Pro injection script loaded for shop:', '${shop}');
})();
`

    // 设置正确的Content-Type为JavaScript
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300') // 5分钟缓存
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    
    res.status(200).send(injectionScript)

  } catch (error) {
    console.error('Widget injection error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
