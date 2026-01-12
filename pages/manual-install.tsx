import { useState } from 'react';
import Head from 'next/head';

export default function ManualInstall() {
  const [shop, setShop] = useState('');
  const [installing, setInstalling] = useState(false);
  const [result, setResult] = useState<any>(null);

  const installScript = async () => {
    if (!shop) {
      alert('请输入店铺域名');
      return;
    }

    setInstalling(true);
    setResult(null);

    try {
      const response = await fetch('/api/manual-install-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <Head>
        <title>手动安装预购脚本 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚀 手动安装预购脚本</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          不需要 App Embed，直接安装预购脚本到你的商店
        </p>

        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3>📝 使用说明</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>输入你的 Shopify 店铺域名（例如：your-store.myshopify.com）</li>
            <li>点击"安装脚本"按钮</li>
            <li>等待安装完成</li>
            <li>访问缺货商品页面验证</li>
          </ol>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>安装预购脚本</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              店铺域名：
            </label>
            <input
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="your-store.myshopify.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            onClick={installScript}
            disabled={installing || !shop}
            style={{
              width: '100%',
              padding: '15px',
              background: installing ? '#ccc' : '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: installing ? 'not-allowed' : 'pointer',
            }}
          >
            {installing ? '安装中...' : '🚀 安装脚本'}
          </button>

          {result && (
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                background: result.success ? '#d4edda' : '#f8d7da',
                color: result.success ? '#155724' : '#721c24',
                borderRadius: '8px',
              }}
            >
              <h4>{result.success ? '✅ 安装成功！' : '❌ 安装失败'}</h4>
              <p>{result.message || result.error}</p>

              {result.success && (
                <div style={{ marginTop: '15px' }}>
                  <p><strong>脚本 URL:</strong></p>
                  <code style={{ background: 'rgba(0,0,0,0.1)', padding: '5px 10px', borderRadius: '4px', display: 'block', marginTop: '5px' }}>
                    {result.scriptUrl}
                  </code>

                  <p style={{ marginTop: '15px' }}><strong>下一步：</strong></p>
                  <ol style={{ marginTop: '10px', lineHeight: '1.8' }}>
                    <li>创建库存为0的测试商品</li>
                    <li>访问商品页面</li>
                    <li>应该能看到预购按钮和徽章</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', background: '#e7f3ff', padding: '20px', borderRadius: '8px' }}>
          <h3>🔧 手动安装方法（备用）</h3>
          <p>如果自动安装失败，可以手动添加脚本到主题：</p>

          <ol style={{ lineHeight: '1.8' }}>
            <li>进入 Shopify Admin → Online Store → Themes</li>
            <li>点击 Actions → Edit code</li>
            <li>找到 theme.liquid 文件</li>
            <li>在 &lt;/head&gt; 标签前添加以下代码：</li>
          </ol>

          <pre style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px',
            marginTop: '10px'
          }}>
            {`<!-- PreOrder Pro -->
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.permanent_domain }}',
    apiUrl: 'https://preorder.orbrother.com/api',
    enabled: true,
    debug: false
  };
</script>
<script src="https://preorder.orbrother.com/shopify-integration.js" async></script>`}
          </pre>
        </div>

        <div style={{ marginTop: '40px', background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
          <h3>⚠️ 注意事项</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>确保你的 App 已经安装到店铺</li>
            <li>确保你有店铺的访问权限</li>
            <li>脚本会自动检测库存为0的商品</li>
            <li>预购按钮会自动显示在缺货商品页面</li>
          </ul>
        </div>
      </div>
    </>
  );
}
