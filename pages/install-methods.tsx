import { useState } from 'react';
import Head from 'next/head';

export default function InstallMethods() {
  const [installing, setInstalling] = useState(false);
  const [result, setResult] = useState<any>(null);

  const installScriptTag = async () => {
    setInstalling(true);
    setResult(null);

    try {
      // 这里需要从session或URL获取shop和accessToken
      const shop = new URLSearchParams(window.location.search).get('shop');
      
      if (!shop) {
        throw new Error('Shop parameter is missing');
      }

      const response = await fetch('/api/install-script-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          // accessToken 应该从服务器session获取
        }),
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
        <title>安装方式选择 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚀 PreOrder Pro 安装方式</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>
          选择最适合你的安装方式，推荐使用 App Embed（无需修改主题代码）
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          {/* 方法1: App Embed */}
          <div style={{ 
            background: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '2px solid #28a745',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>✅</span>
              <h2 style={{ margin: 0 }}>方法1: App Embed</h2>
            </div>
            
            <div style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '10px 15px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              推荐方式 - 无需修改代码
            </div>

            <h3>✨ 优点：</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>✅ 无需修改主题代码</li>
              <li>✅ 一键启用/禁用</li>
              <li>✅ 自动适配所有主题</li>
              <li>✅ 更新自动生效</li>
              <li>✅ 不影响主题性能</li>
            </ul>

            <h3>📝 安装步骤：</h3>
            <ol style={{ lineHeight: '1.8' }}>
              <li>部署扩展：<code style={{ background: '#f0f0f0', padding: '2px 6px' }}>shopify app deploy</code></li>
              <li>进入 Shopify Admin → Online Store → Themes</li>
              <li>点击 "Customize" 进入主题编辑器</li>
              <li>点击左侧 "App embeds" 或 "应用嵌入"</li>
              <li>找到 "PreOrder Pro - 预购插件"</li>
              <li>打开开关启用</li>
              <li>点击 "Save" 保存</li>
            </ol>

            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '6px', 
              marginTop: '20px' 
            }}>
              <strong>💡 提示：</strong> 如果看不到 App Embed，请确保已经运行 <code>shopify app deploy</code>
            </div>
          </div>

          {/* 方法2: Script Tags API */}
          <div style={{ 
            background: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            border: '2px solid #ffc107',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>⚙️</span>
              <h2 style={{ margin: 0 }}>方法2: Script Tags API</h2>
            </div>

            <div style={{ 
              background: '#fff3cd', 
              color: '#856404', 
              padding: '10px 15px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              备用方案 - 自动注入脚本
            </div>

            <h3>✨ 优点：</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>✅ 自动安装，无需手动操作</li>
              <li>✅ 适用于所有主题</li>
              <li>✅ 程序化管理</li>
            </ul>

            <h3>⚠️ 缺点：</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>❌ 可能影响页面加载速度</li>
              <li>❌ 需要API权限</li>
              <li>❌ 卸载App时需要手动清理</li>
            </ul>

            <h3>📝 安装步骤：</h3>
            <ol style={{ lineHeight: '1.8' }}>
              <li>确保App已安装到商店</li>
              <li>点击下方按钮自动安装</li>
              <li>等待安装完成</li>
              <li>访问商品页面测试</li>
            </ol>

            <button
              onClick={installScriptTag}
              disabled={installing}
              style={{
                width: '100%',
                padding: '15px',
                background: installing ? '#ccc' : '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: installing ? 'not-allowed' : 'pointer',
                marginTop: '20px',
              }}
            >
              {installing ? '安装中...' : '🚀 自动安装 Script Tag'}
            </button>

            {result && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: result.success ? '#d4edda' : '#f8d7da',
                color: result.success ? '#155724' : '#721c24',
                borderRadius: '6px',
              }}>
                {result.success ? '✅ ' : '❌ '}
                {result.message || result.error}
              </div>
            )}
          </div>
        </div>

        {/* 方法3: 手动安装 */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          border: '2px solid #6c757d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px', marginRight: '12px' }}>🔧</span>
            <h2 style={{ margin: 0 }}>方法3: 手动安装（高级用户）</h2>
          </div>

          <p style={{ color: '#666' }}>
            如果你熟悉 Shopify 主题开发，可以手动添加脚本到主题文件中。
          </p>

          <h3>📝 安装步骤：</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>进入 Shopify Admin → Online Store → Themes</li>
            <li>点击 "Actions" → "Edit code"</li>
            <li>找到 <code>theme.liquid</code> 文件</li>
            <li>在 <code>&lt;/head&gt;</code> 标签前添加以下代码：</li>
          </ol>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '6px', 
            fontFamily: 'monospace',
            fontSize: '14px',
            overflow: 'auto',
            marginBottom: '20px'
          }}>
            <pre style={{ margin: 0 }}>{`<!-- PreOrder Pro -->
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.permanent_domain }}',
    apiUrl: 'https://preorder-pro-fix.vercel.app/api',
    enabled: true,
    debug: false
  };
</script>
<script src="https://preorder-pro-fix.vercel.app/shopify-integration.js" async></script>`}</pre>
          </div>

          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '15px', 
            borderRadius: '6px' 
          }}>
            <strong>⚠️ 注意：</strong> 手动安装需要在每次更新主题时重新添加代码。推荐使用 App Embed 方式。
          </div>
        </div>

        {/* 对比表格 */}
        <div style={{ marginTop: '40px' }}>
          <h2>📊 安装方式对比</h2>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>特性</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>App Embed</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Script Tags</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>手动安装</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>无需修改代码</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>✅</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>✅</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>❌</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>一键启用/禁用</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>✅</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>❌</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>❌</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>自动更新</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>✅</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>✅</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>❌</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>性能影响</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>最小</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>中等</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>最小</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>安装难度</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>简单</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>简单</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>中等</td>
              </tr>
              <tr style={{ background: '#d4edda' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>推荐度</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>⭐⭐⭐⭐⭐</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>⭐⭐⭐</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 测试说明 */}
        <div style={{ 
          marginTop: '40px', 
          background: '#e7f3ff', 
          padding: '30px', 
          borderRadius: '12px',
          border: '2px solid #0066cc'
        }}>
          <h2>🧪 安装后测试</h2>
          <p>无论使用哪种安装方式，请按以下步骤测试：</p>
          <ol style={{ lineHeight: '1.8' }}>
            <li>创建一个测试商品，将库存设置为 <strong>0</strong></li>
            <li>访问该商品页面</li>
            <li>应该能看到 <strong>预购按钮</strong> 和 <strong>预购徽章</strong></li>
            <li>打开浏览器控制台（F12），应该看到：<code>🚀 PreOrder Pro App Embed Block Loaded</code></li>
            <li>点击预购按钮测试功能</li>
          </ol>
        </div>
      </div>
    </>
  );
}
