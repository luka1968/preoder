import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, action } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  // 这里我们需要从数据库获取 access token
  // 但为了快速测试，我们先返回手动注入的脚本代码
  
  if (action === 'script') {
    // 返回可以直接在浏览器控制台运行的脚本
    const scriptCode = `
// PreOrder Pro - 快速注入脚本
(function() {
  console.log('🚀 PreOrder Pro Quick Inject Starting...');
  
  // 检测售罄按钮
  const soldOutButtons = document.querySelectorAll('button:disabled, input:disabled');
  console.log('Found disabled buttons:', soldOutButtons.length);
  
  let foundSoldOut = false;
  soldOutButtons.forEach((btn, index) => {
    const text = (btn.textContent || btn.value || '').toLowerCase();
    console.log('Button ' + (index + 1) + ' text:', text);
    
    if (text.includes('sold out') || text.includes('unavailable')) {
      console.log('✅ Found sold out button:', btn);
      foundSoldOut = true;
      
      // 创建预购按钮
      const preorderBtn = document.createElement('button');
      preorderBtn.innerHTML = '🛒 立即预订 Pre-Order Now';
      preorderBtn.style.cssText = \`
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
        color: white !important;
        border: none !important;
        padding: 15px 30px !important;
        border-radius: 8px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        width: 100% !important;
        font-size: 16px !important;
        margin: 10px 0 !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3) !important;
      \`;
      
      preorderBtn.onclick = function() {
        alert('🎉 预购功能测试成功！\\n\\n✅ PreOrder Pro 工作正常\\n📍 商店: ${shop}\\n🕒 时间: ' + new Date().toLocaleString());
      };
      
      // 隐藏原按钮，插入预购按钮
      btn.style.display = 'none';
      btn.parentNode.insertBefore(preorderBtn, btn.nextSibling);
      
      console.log('✅ PreOrder button created and inserted');
    }
  });
  
  if (!foundSoldOut) {
    console.log('❌ No sold out button found');
    alert('⚠️ 未检测到售罄按钮\\n\\n请确保产品确实是售罄状态');
  } else {
    console.log('🎉 PreOrder Pro injection complete!');
  }
})();
`;

    return res.json({
      success: true,
      shop: shop,
      scriptCode: scriptCode,
      instructions: [
        '1. 访问你的产品页面',
        '2. 按 F12 打开开发者工具',
        '3. 切换到 Console 标签',
        '4. 复制下面的 scriptCode 并粘贴运行',
        '5. 应该会看到预购按钮出现'
      ]
    })
  }

  // 默认返回使用说明
  return res.json({
    message: 'PreOrder Pro Quick Inject API',
    shop: shop,
    usage: {
      getScript: `${req.headers.host}/api/quick-inject?shop=${shop}&action=script`,
      testUrl: `https://${shop}/products/test-01?variant=46938889552121`
    },
    instructions: [
      '访问 getScript URL 获取可运行的脚本代码',
      '在产品页面的浏览器控制台运行脚本',
      '检查预购按钮是否出现'
    ]
  })
}
