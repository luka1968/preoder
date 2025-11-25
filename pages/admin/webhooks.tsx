import { useState, useEffect } from 'react'

export default function WebhooksPage() {
    const [shop, setShop] = useState('')
    const [webhooks, setWebhooks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const shopParam = new URLSearchParams(window.location.search).get('shop')
        if (shopParam) {
            setShop(shopParam)
            loadWebhooks(shopParam)
        }
    }, [])

    async function loadWebhooks(shopDomain: string) {
        setLoading(true)
        try {
            const res = await fetch(`/api/webhooks/status?shop=${shopDomain}`)
            const data = await res.json()
            setWebhooks(data.webhooks || [])
        } catch (error) {
            console.error('Failed to load webhooks:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <header>
                <h1>Webhook Status</h1>
                <button onClick={() => loadWebhooks(shop)}>🔄 Refresh</button>
            </header>

            {loading ? <div className="loading">Loading...</div> : (
                <div className="webhooks-grid">
                    {webhooks.map(webhook => (
                        <div key={webhook.id} className={`webhook-card ${webhook.is_healthy ? 'healthy' : 'unhealthy'}`}>
                            <div className="webhook-header">
                                <h3>{webhook.topic}</h3>
                                <span className={`status ${webhook.is_healthy ? 'success' : 'error'}`}>
                                    {webhook.is_healthy ? '✅ Healthy' : '❌ Issues'}
                                </span>
                            </div>

                            <div className="webhook-stats">
                                <div className="stat">
                                    <span className="label">Total Received</span>
                                    <strong>{webhook.total_received || 0}</strong>
                                </div>
                                <div className="stat">
                                    <span className="label">Success</span>
                                    <strong style={{ color: '#48bb78' }}>{webhook.success_count || 0}</strong>
                                </div>
                                <div className="stat">
                                    <span className="label">Failures</span>
                                    <strong style={{ color: '#f56565' }}>{webhook.failure_count || 0}</strong>
                                </div>
                            </div>

                            {webhook.last_received_at && (
                                <div className="webhook-info">
                                    Last received: {new Date(webhook.last_received_at).toLocaleString()}
                                </div>
                            )}

                            {webhook.last_error && (
                                <div className="webhook-error">
                                    <strong>Last Error:</strong> {webhook.last_error}
                                </div>
                            )}

                            {!webhook.is_registered && (
                                <div className="webhook-warning">
                                    ⚠️ Not registered with Shopify
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        button { padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .webhooks-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .webhook-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
        .webhook-card.healthy { border-left: 4px solid #48bb78; }
        .webhook-card.unhealthy { border-left: 4px solid #f56565; }
        .webhook-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .webhook-header h3 { color: #2d3748; margin: 0; }
        .status { padding: 6px 12px; border-radius: 12px; font-size: 14px; font-weight: 500; }
        .status.success { background: #c6f6d5; color: #22543d; }
        .status.error { background: #fed7d7; color: #c53030; }
        .webhook-stats { display: flex; gap: 16px; margin-bottom: 16px; }
        .stat { text-align: center; }
        .stat .label { display: block; color: #718096; font-size: 12px; margin-bottom: 4px; }
        .stat strong { font-size: 24px; color: #2d3748; }
        .webhook-info { color: #718096; font-size: 14px; margin-top: 12px; }
        .webhook-error { background: #fed7d7; padding: 12px; border-radius: 6px; margin-top: 12px; font-size: 14px; color: #c53030; }
        .webhook-warning { background: #feebc8; padding: 12px; border-radius: 6px; margin-top: 12px; font-size: 14px; color: #7c2d12; }
      `}</style>
        </div>
    )
}
