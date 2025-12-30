import { useState, useEffect } from 'react'

export default function InventoryMonitorPage() {
    const [shop, setShop] = useState('')
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [processing, setProcessing] = useState<Set<string>>(new Set())
    const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set())
    const [batchProcessing, setBatchProcessing] = useState(false)
    const [showBatchConfig, setShowBatchConfig] = useState(false)
    const [batchShippingDate, setBatchShippingDate] = useState('')

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
        try {
            await fetch(`/api/cron/inventory-sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop })
            })
            await loadData(shop)
        } catch (error) {
            console.error('Sync failed:', error)
        } finally {
            setSyncing(false)
        }
    }

    async function handleBatchOperation(enabled: boolean) {
        if (selectedVariants.size === 0) {
            alert('Please select products first')
            return
        }

        if (!confirm(`Confirm batch ${enabled ? 'enable' : 'disable'} pre-order for ${selectedVariants.size} products?`)) {
            return
        }

        setBatchProcessing(true)
        try {
            const response = await fetch('/api/products/batch-preorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shop,
                    variantIds: Array.from(selectedVariants),
                    enabled,
                    estimatedShippingDate: batchShippingDate || undefined
                })
            })

            const result = await response.json()

            if (response.ok) {
                alert(`Batch operation completed!\nSuccess: ${result.summary.success}\nFailed: ${result.summary.failed}`)
                setSelectedVariants(new Set())
                setShowBatchConfig(false)
                await loadData(shop)
            } else {
                alert(`Batch operation failed: ${result.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Batch operation failed:', error)
            alert('Batch operation failed')
        } finally {
            setBatchProcessing(false)
        }
    }

    if (loading || !data) return <div className="loading">Loading...</div>

    return (
        <div className="container">
            <header>
                <h1>Inventory Monitor</h1>
                <div className="header-actions">
                    {selectedVariants.size > 0 && (
                        <div className="batch-actions">
                            <button
                                onClick={() => setShowBatchConfig(!showBatchConfig)}
                                className="btn btn-primary"
                            >
                                📦 Batch Actions ({selectedVariants.size})
                            </button>
                            <button
                                onClick={() => setSelectedVariants(new Set())}
                                className="btn btn-secondary"
                            >
                                Clear Selection
                            </button>
                        </div>
                    )}
                    <button onClick={handleSync} disabled={syncing}>
                        {syncing ? 'Syncing...' : '🔄 Manual Sync'}
                    </button>
                </div>
            </header>

            {showBatchConfig && selectedVariants.size > 0 && (
                <div className="batch-config-panel">
                    <h3>📦 Batch Enable Pre-order ({selectedVariants.size} products)</h3>
                    <div className="batch-form">
                        <div className="form-group">
                            <label>Estimated Shipping Date (optional)</label>
                            <input
                                type="date"
                                lang="en"
                                value={batchShippingDate}
                                onChange={(e) => setBatchShippingDate(e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="batch-buttons">
                            <button
                                onClick={() => handleBatchOperation(true)}
                                disabled={batchProcessing}
                                className="btn btn-success"
                            >
                                {batchProcessing ? 'Processing...' : '✅ Batch Enable'}
                            </button>
                            <button
                                onClick={() => handleBatchOperation(false)}
                                disabled={batchProcessing}
                                className="btn btn-warning"
                            >
                                {batchProcessing ? 'Processing...' : '❌ Batch Disable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                <h2>
                    Out of Stock Products ({data.out_of_stock.length})
                    {data.out_of_stock.length > 0 && (
                        <button
                            onClick={() => {
                                if (selectedVariants.size === data.out_of_stock.length) {
                                    setSelectedVariants(new Set())
                                } else {
                                    setSelectedVariants(new Set(data.out_of_stock.map((p: any) => p.variant_id.toString())))
                                }
                            }}
                            className="btn-link"
                            style={{ marginLeft: '10px', fontSize: '14px' }}
                        >
                            {selectedVariants.size === data.out_of_stock.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </h2>
                <div className="products-list">
                    {data.out_of_stock.map((p: any) => (
                        <div key={p.variant_id} className="product-card">
                            <input
                                type="checkbox"
                                checked={selectedVariants.has(p.variant_id.toString())}
                                onChange={(e) => {
                                    const variantId = p.variant_id.toString()
                                    const newSet = new Set(selectedVariants)
                                    if (e.target.checked) {
                                        newSet.add(variantId)
                                    } else {
                                        newSet.delete(variantId)
                                    }
                                    setSelectedVariants(newSet)
                                }}
                                className="product-checkbox"
                            />
                            <div className="product-main">
                                <div className="product-info">
                                    <h3>{p.product_title}</h3>
                                    {p.variant_title && p.variant_title !== 'Default Title' && (
                                        <p className="variant-title">{p.variant_title}</p>
                                    )}
                                    <div className="product-meta">
                                        <span className="sku">SKU: {p.sku || 'N/A'}</span>
                                        <span className="quantity">Stock: {p.quantity}</span>
                                        <span className="variant-id">ID: {p.variant_id}</span>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    {p.preorder_enabled ? (
                                        <>
                                            <span className="status-badge status-enabled">✓ Pre-order Enabled</span>
                                            <button
                                                onClick={async () => {
                                                    const variantId = p.variant_id.toString()
                                                    setProcessing(prev => new Set(prev).add(variantId))
                                                    try {
                                                        const response = await fetch('/api/products/enable-preorder', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                shop: shop,
                                                                productId: p.product_id,
                                                                variantId: p.variant_id,
                                                                enabled: false
                                                            })
                                                        })

                                                        if (response.ok) {
                                                            alert('Pre-order successfully disabled!')
                                                            await loadData(shop)
                                                        } else {
                                                            const error = await response.json()
                                                            alert(`Failed to disable pre-order: ${error.error || 'Unknown error'}`)
                                                        }
                                                    } catch (error) {
                                                        console.error('Error:', error)
                                                        alert('Failed to disable pre-order')
                                                    } finally {
                                                        setProcessing(prev => {
                                                            const newSet = new Set(prev)
                                                            newSet.delete(variantId)
                                                            return newSet
                                                        })
                                                    }
                                                }}
                                                className="btn btn-warning"
                                                disabled={processing.has(p.variant_id.toString())}
                                            >
                                                {processing.has(p.variant_id.toString()) ? 'Processing...' : 'Disable Pre-order'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                const variantId = p.variant_id.toString()
                                                setProcessing(prev => new Set(prev).add(variantId))
                                                try {
                                                    const response = await fetch('/api/products/enable-preorder', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            shop: shop,
                                                            productId: p.product_id,
                                                            variantId: p.variant_id,
                                                            enabled: true
                                                        })
                                                    })

                                                    if (response.ok) {
                                                        alert('Pre-order successfully enabled!')
                                                        await loadData(shop)
                                                    } else {
                                                        const error = await response.json()
                                                        alert(`Failed to enable pre-order: ${error.error || 'Unknown error'}`)
                                                    }
                                                } catch (error) {
                                                    console.error('Error:', error)
                                                    alert('Failed to enable pre-order')
                                                } finally {
                                                    setProcessing(prev => {
                                                        const newSet = new Set(prev)
                                                        newSet.delete(variantId)
                                                        return newSet
                                                    })
                                                }
                                            }}
                                            className="btn btn-primary"
                                            disabled={processing.has(p.variant_id.toString())}
                                        >
                                            {processing.has(p.variant_id.toString()) ? 'Processing...' : 'Enable Pre-order'}
                                        </button>
                                    )}
                                    <a
                                        href={`https://${shop}/admin/products/${p.product_id}/variants/${p.variant_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        View in Shopify
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
                header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                h1 { color: #1a202c; font-size: 32px; margin: 0; }
                button { padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.2s; }
                button:hover:not(:disabled) { background: #3182ce; }
                button:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
                .stat { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
                .stat strong { display: block; font-size: 32px; color: #2d3748; margin-bottom: 8px; }
                .stat span { color: #718096; font-size: 14px; }
                .stat.success strong { color: #48bb78; }
                .stat.warning strong { color: #ed8936; }
                
                .section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                .section h2 { color: #2d3748; margin: 0 0 20px 0; font-size: 20px; }
                
                .products-list { display: grid; gap: 16px; }
                .product-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; transition: box-shadow 0.2s; }
                .product-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                
                .product-main { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
                .product-info { flex: 1; min-width: 300px; }
                .product-info h3 { color: #2d3748; font-size: 18px; margin: 0 0 8px 0; }
                .variant-title { color: #4a5568; font-size: 14px; margin: 0 0 12px 0; }
                
                .product-meta { display: flex; gap: 16px; flex-wrap: wrap; }
                .product-meta span { color: #718096; font-size: 13px; padding: 4px 10px; background: white; border-radius: 4px; }
                .quantity { font-weight: 600; color: #e53e3e; }
                
                .product-actions { display: flex; gap: 12px; align-items: center; }
                .btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; text-decoration: none; display: inline-block; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-primary { background: #4299e1; color: white; }
                .btn-primary:hover:not(:disabled) { background: #3182ce; transform: translateY(-1px); }
                .btn-secondary { background: white; color: #4a5568; border: 1px solid #cbd5e0; }
                .btn-secondary:hover { background: #f7fafc; }
                .btn-warning { background: #ed8936; color: white; }
                .btn-warning:hover:not(:disabled) { background: #dd6b20; transform: translateY(-1px); }
                .btn:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .status-badge { padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
                .status-enabled { background: #c6f6d5; color: #22543d; border: 1px solid #9ae6b4; }
                
                .loading { display: flex; align-items: center; justify-content: center; min-height: 400px; font-size: 18px; color: #718096; }
            `}</style>
        </div>
    )
}
