import { useState, useEffect } from 'react'

export default function SystemLogsPage() {
    const [shop, setShop] = useState('')
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const shopParam = new URLSearchParams(window.location.search).get('shop')
        if (shopParam) {
            setShop(shopParam)
            loadLogs(shopParam, filter)
        }
    }, [filter])

    async function loadLogs(shopDomain: string, type: string) {
        setLoading(true)
        try {
            const res = await fetch(`/api/system/logs?shop=${shopDomain}&type=${type}&limit=200`)
            const data = await res.json()
            setLogs(data.logs || [])
        } catch (error) {
            console.error('Failed to load logs:', error)
        } finally {
            setLoading(false)
        }
    }

    function getLevelColor(level: string) {
        switch (level) {
            case 'error': return '#f56565'
            case 'warning': return '#ed8936'
            default: return '#4299e1'
        }
    }

    return (
        <div className="container">
            <header>
                <h1>System Logs</h1>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Logs</option>
                    <option value="auto_preorder">Auto Pre-order</option>
                    <option value="inventory_webhook">Inventory Webhook</option>
                    <option value="order_created">Orders</option>
                    <option value="error">Errors Only</option>
                </select>
            </header>

            {loading ? <div className="loading">Loading...</div> : (
                <div className="logs">
                    {logs.map(log => (
                        <div key={log.id} className="log-card" style={{ borderLeftColor: getLevelColor(log.level) }}>
                            <div className="log-header">
                                <span className="log-type">{log.type}</span>
                                <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div className="log-message">{log.message || log.action}</div>
                            {log.variant_id && <div className="log-meta">Variant: {log.variant_id}</div>}
                            {log.error_message && (
                                <div className="log-error">{log.error_message}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        select { padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 6px; }
        .logs { display: flex; flex-direction: column; gap: 12px; }
        .log-card { background: white; border-left: 4px solid; padding: 16px; border-radius: 6px; }
        .log-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .log-type { font-weight: 600; color: #2d3748; }
        .log-time { color: #a0aec0; font-size: 14px; }
        .log-message { color: #4a5568; margin-bottom: 8px; }
        .log-meta { font-size: 12px; color: #718096; }
        .log-error { background: #fed7d7; padding: 8px; border-radius: 4px; margin-top: 8px; color: #c53030; font-size: 14px; }
      `}</style>
        </div>
    )
}
