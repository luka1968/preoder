import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function CheckConfig() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/check-config')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>配置检查 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1 style={{ marginBottom: '24px' }}>⚙️ 应用配置检查</h1>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>正在检查配置...</p>
          </div>
        )}

        {!loading && result && !result.error && (
          <>
            {/* 健康度评分 */}
            <div style={{
              background: result.healthy ? '#d4edda' : '#fff3cd',
              border: `2px solid ${result.healthy ? '#c3e6cb' : '#ffeaa7'}`,
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {result.healthy ? '✅' : '⚠️'}
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
                健康度: {result.healthScore}%
              </h2>
              <p style={{ margin: 0, fontSize: '18px', color: '#666' }}>
                {result.passedChecks} / {result.totalChecks} 项检查通过
              </p>
            </div>

            {/* 建议 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>📋 配置建议</h3>
              <ul style={{ lineHeight: '1.8' }}>
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} style={{
                    color: rec.startsWith('✅') ? '#155724' : rec.startsWith('❌') ? '#721c24' : '#856404'
                  }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shopify 配置 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>🏪 Shopify 配置</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold', width: '200px' }}>API Key</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.shopify.hasApiKey ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.shopify.apiKey}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>API Secret</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.shopify.hasApiSecret ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.shopify.apiSecret}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>App URL</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.shopify.hasAppUrl ? (
                        <span style={{ color: result.status.shopify.appUrlCorrect ? '#155724' : '#856404' }}>
                          {result.status.shopify.appUrlCorrect ? '✅' : '⚠️'} {result.config.shopify.appUrl}
                        </span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>Scopes</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.shopify.hasScopes ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.shopify.scopes}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Supabase 配置 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>🗄️ Supabase 配置</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold', width: '200px' }}>URL</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.supabase.hasUrl ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.supabase.url}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>Anon Key</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.supabase.hasAnonKey ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.supabase.anonKey}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>Service Role Key</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.supabase.hasServiceRoleKey ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.supabase.serviceRoleKey}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 邮件配置 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>📧 邮件配置</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold', width: '200px' }}>Brevo API Key</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.email.hasBrevoKey ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.email.brevoApiKey}</span>
                      ) : (
                        <span style={{ color: '#856404' }}>⚠️ 未设置（可选）</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>SMTP 配置</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.email.hasSmtpConfig ? (
                        <span style={{ color: '#155724' }}>
                          ✅ {result.config.email.smtpHost}:{result.config.email.smtpPort}
                        </span>
                      ) : (
                        <span style={{ color: '#856404' }}>⚠️ 未设置（可选）</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 应用配置 */}
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>🚀 应用配置</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold', width: '200px' }}>环境</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.app.isProduction ? (
                        <span style={{ color: '#155724' }}>✅ Production</span>
                      ) : (
                        <span style={{ color: '#856404' }}>⚠️ {result.config.app.nodeEnv || 'Development'}</span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>Public URL</td>
                    <td style={{ padding: '12px 0' }}>
                      {result.status.app.hasPublicUrl ? (
                        <span style={{ color: '#155724' }}>✅ {result.config.app.nextPublicAppUrl}</span>
                      ) : (
                        <span style={{ color: '#721c24' }}>❌ 未设置</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && result?.error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>❌ 错误</h3>
            <p>{result.error}</p>
          </div>
        )}

        <button
          onClick={checkConfig}
          disabled={loading}
          style={{
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '24px'
          }}
        >
          {loading ? '检查中...' : '🔄 重新检查'}
        </button>

        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          color: '#0d47a1',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <h3 style={{ marginTop: 0 }}>💡 如何修复配置问题</h3>
          <ol>
            <li><strong>在 Vercel Dashboard 中设置环境变量</strong></li>
            <li><strong>在 Shopify Partner Dashboard 中更新 App URL 和 Redirect URLs</strong></li>
            <li><strong>重新部署应用</strong></li>
            <li><strong>重新运行此检查</strong></li>
          </ol>
          <p style={{ marginBottom: 0 }}>
            详细步骤请查看 <code>FIX_INSTALL_LINK.md</code> 文件
          </p>
        </div>
      </div>
    </>
  )
}
