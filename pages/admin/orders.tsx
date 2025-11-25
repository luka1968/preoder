import { useState, useEffect } from 'react'

export default function PreorderOrdersPage() {
    const [shop, setShop] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const shopParam = new URLSearchParams(window.location.search).get('shop')
        if (shopParam) {
            setShop(shopParam)
            loadOrders(shopParam)
        }
    }, [])

    async function loadOrders(shopDomain: string) {
        setLoading(true)
        try {
            const res = await fetch(`/api/orders/preorder?shop=${shopDomain}&limit=100`)
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'paid': return '#48bb78'
            case 'pending': return '#ed8936'
            case 'refunded': return '#f56565'
            default: return '#718096'
        }
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div className="container">
            <header>
                <h1>Pre-order Orders</h1>
                <div className="stats">
                    <span><strong>{orders.length}</strong> total orders</span>
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="empty">
                    <p>📦 No pre-order orders yet</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3>Order #{order.order_number}</h3>
                                    <span className="order-email">{order.customer_email}</span>
                                </div>
                                <div className="order-amount">${parseFloat(order.total_price).toFixed(2)}</div>
                            </div>

                            <div className="order-status">
                                <span
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(order.financial_status) }}
                                >
                                    {order.financial_status}
                                </span>
                                {order.fulfillment_status && (
                                    <span className="status-badge secondary">
                                        {order.fulfillment_status}
                                    </span>
                                )}
                            </div>

                            <div className="order-items">
                                <strong>Items:</strong>
                                {order.line_items?.map((item: any, i: number) => (
                                    <div key={i} className="item">
                                        • {item.title} {item.variant_title && `(${item.variant_title})`} × {item.quantity}
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <span className="order-date">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                                <a
                                    href={`https://${shop}/admin/orders/${order.order_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-link"
                                >
                                    View in Shopify →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { color: #1a202c; margin: 0; }
        .stats span { color: #718096; }
        .stats strong { color: #2d3748; }
        .empty { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 60px; text-align: center; }
        .empty p { color: #a0aec0; font-size: 18px; }
        .orders-list { display: flex; flex-direction: column; gap: 16px; }
        .order-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
        .order-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px; }
        .order-header h3 { color: #2d3748; margin: 0 0 4px 0; }
        .order-email { color: #718096; font-size: 14px; }
        .order-amount { font-size: 24px; font-weight: 700; color: #2d3748; }
        .order-status { display: flex; gap: 8px; margin-bottom: 16px; }
        .status-badge { padding: 6px 12px; border-radius: 12px; color: white; font-size: 12px; font-weight: 600; }
        .status-badge.secondary { background: #718096; }
        .order-items { background: #f7fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
        .order-items strong { display: block; margin-bottom: 8px; color: #2d3748; }
        .item { color: #4a5568; font-size: 14px; margin: 4px 0; }
        .order-footer { display: flex; justify-content: space-between; align-items: center; }
        .order-date { color: #a0aec0; font-size: 14px; }
        .view-link { color: #4299e1; text-decoration: none; font-weight: 500; }
        .view-link:hover { text-decoration: underline; }
      `}</style>
        </div>
    )
}
