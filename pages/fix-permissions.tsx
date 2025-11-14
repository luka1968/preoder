import { useState } from 'react'
import Head from 'next/head'

export default function FixPermissions() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'fixing' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const shop = 'arivi-shop.myshopify.com'

  const checkPermissions = async () => {
    setStatus('checking')
    setError('')
    
    try {
      const res = await fetch('/api/check-scopes')
      const data = await res.json()
      setResult(data)
      
      if (data.dbHasWriteDraftOrders) {
        setStatus('success')
      } else {
        setStatus('idle')
      }
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  const quickFix = async () => {
    setStatus('fixing')
    setError('')
    
    try {
      const res = await fetch('/api/quick-fix-scope', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        setResult(data)
        setStatus('success')
      } else {
        setError(data.error || '修复失败')
        setStatus('error')
      }
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  const reauthorize = () => {
    window.location.href = `/api/auth/shopify?shop=${shop}`
  }

  return (
    <>
      <Head>
        <title>修复权限问题 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1>🔧 修复权限问题</h1>

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0 }}>⚠️ 问题说明</h3>
          <p>
            应用需要 <code>write_draft_orders</code> 权限才能创建预购订单。
            目前 Vercel 环境变量已配置，但数据库中的权限还未更新。
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={checkPermissions}
            disabled={status === 'checking'}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '6px',
              cursor: status === 'checking' ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {status === 'checking' ? '检查中...' : '🔍 检查当前权限'}
          </button>

          <button
            onClick={quickFix}
            disabled={status === 'fixing'}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '6px',
              cursor: status === 'fixing' ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {status === 'fixing' ? '修复中...' : '⚡ 快速修复（更新数据库）'}
          </button>

          <button
            onClick={reauthorize}
            style={{
              background: '#5c6ac4',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🔐 重新授权（推荐方式）
          </button>
        </div>

        {status === 'success' && result && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0, color: '#155724' }}>✅ 成功！</h3>
            {result.message && <p>{result.message}</p>}
            {result.after && (
              <div>
                <p><strong>更新后的权限：</strong></p>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto'
                }}>
                  {result.after.scope}
                </pre>
                <p>
                  <strong>包含 write_draft_orders:</strong> {result.after.hasWriteDraftOrders ? '是 ✅' : '否 ❌'}
                </p>
              </div>
            )}
            <div style={{ marginTop: '16px' }}>
              <a 
                href="/test-direct" 
                style={{
                  display: 'inline-block',
                  background: '#007bff',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                🧪 测试 Draft Order 创建
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginTop: 0, color: '#721c24' }}>❌ 错误</h3>
            <p>{error}</p>
          </div>
        )}

        {result && status !== 'error' && (
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>📊 权限状态</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <h4>环境变量 (Vercel)</h4>
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {result.envScope || '未配置'}
              </pre>
              <p>
                <strong>包含 write_draft_orders:</strong> {result.envHasWriteDraftOrders ? '是 ✅' : '否 ❌'}
              </p>
            </div>

            <div>
              <h4>数据库 (Supabase)</h4>
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {result.dbScope || '未配置'}
              </pre>
              <p>
                <strong>包含 write_draft_orders:</strong> {result.dbHasWriteDraftOrders ? '是 ✅' : '否 ❌'}
              </p>
            </div>

            <div style={{
              background: result.status === '配置正确，可以创建 Draft Orders' ? '#d4edda' : '#fff3cd',
              padding: '12px',
              borderRadius: '4px',
              marginTop: '16px'
            }}>
              <strong>状态：</strong> {result.status}
            </div>
          </div>
        )}

        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px',
          fontSize: '14px'
        }}>
          <h4 style={{ marginTop: 0 }}>💡 修复方式对比</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>方式</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>优点</th>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>缺点</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>快速修复</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>立即生效，无需重新授权</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>只更新数据库，不更新 token</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>重新授权</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>获取新 token，完全正确</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>需要商家批准</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
