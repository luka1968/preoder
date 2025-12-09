import { useState, useEffect } from 'react'

export default function InventoryMonitorPage() {
    const [shop, setShop] = useState('')
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        const shopParam = new URLSearchParams(window.location.search).get('shop')
        if (shopParam) {
            setShop(shopParam)
            loadData(shopParam)
        }
    }, [])

    async function loadData(shopDomain: string) {
        setLoading(true)
        try {
            const res = await fetch(`/api/inventory/all-products?shop=${shopDomain}`)
            const result = await res.json()

            // 转换格式以匹配现有 UI
            setData({
                out_of_stock: result.out_of_stock || [],
                total: result.total_out_of_stock || 0,
                synced: true,
            })
        } catch (error) {
            console.error('Failed to load:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        // Trigger manual sync
        await fetch(`/api/cron/inventory-sync`, {
            headers: { 'x-cron-secret': 'manual' }
        })
        await loadData(shop)
        setSyncing(false)
    }

    if (loading || !data) return <div className="loading">Loading...</div>

    return (
        <div className="container">
            <header>
                <h1>Inventory Monitor</h1>
                <button onClick={handleSync} disabled={syncing}>
                    {syncing ? 'Syncing...' : '🔄 Manual Sync'}
                </button>
            </header>

            <div className="stats">
                <div className="stat">
                    <strong>{data.total}</strong>
                    <span>Out of Stock</span>
                </div>
                <div className="stat">
                    <strong>{data.discrepancies?.length || 0}</strong>
                    <span>Sync Issues</span>
                </div>
                <div className={`stat ${data.synced ? 'success' : 'warning'}`}>
                    <strong>{data.synced ? '✅' : '⚠️'}</strong>
                    <span>{data.synced ? 'Synced' : 'Issues Found'}</span>
                </div>
            </div>

            {data.discrepancies && data.discrepancies.length > 0 && (
                <div className="section">
                    <h2>⚠️ Sync Issues ({data.discrepancies.length})</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Variant ID</th>
                                <th>Issue</th>
                                <th>Current</th>
                                <th>Expected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.discrepancies.map((d: any) => (
                                <tr key={d.variant_id}>
                                    <td>{d.variant_id}</td>
                                    <td>{d.issue}</td>
                                    <td>{d.current_status}</td>
                                    <td>{d.expected_status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="section">
                <h2>Out of Stock Products ({data.out_of_stock.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Variant ID</th>
                            <th>Quantity</th>
                            <th>Threshold</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.out_of_stock.map((p: any) => (
                            <tr key={p.variant_id}>
                                <td>{p.variant_id}</td>
                                <td>{p.quantity}</td>
                                <td>{p.threshold}</td>
                                <td>
                                    <span className={`badge ${p.auto_enabled ? 'success' : 'inactive'}`}>
                                        {p.auto_enabled ? 'Auto Enabled' : 'Not Enabled'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        button { padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
        .stat strong { display: block; font-size: 32px; color: #2d3748; margin-bottom: 8px; }
        .stat span { color: #718096; font-size: 14px; }
        .stat.success strong { color: #48bb78; }
        .stat.warning strong { color: #ed8936; }
        .section { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { color: #718096; font-weight: 500; }
        .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
        .badge.success { background: #c6f6d5; color: #22543d; }
        .badge.inactive { background: #e2e8f0; color: #4a5568; }
      `}</style>
        </div>
    )
}
