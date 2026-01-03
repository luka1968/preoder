import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function PendingPaymentsPage() {
    const router = useRouter()
    const { shop } = router.query

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all | expiring_soon | overdue

    useEffect(() => {
        if (shop) {
            loadPendingOrders()
        }
    }, [shop])

    async function loadPendingOrders() {
        try {
            setLoading(true)
            // Query all pending payment orders
            const response = await fetch(`/api/campaigns?shop=${shop}`)
            const data = await response.json()

            if (data.success) {
                // Extract pending payment orders from all campaigns
                const allOrders = []
                for (const campaign of data.campaigns) {
                    const campaignResponse = await fetch(`/api/campaigns/${campaign.id}?shop=${shop}`)
                    const campaignData = await campaignResponse.json()
                    if (campaignData.success && campaignData.campaign.orders) {
                        const pendingOrders = campaignData.campaign.orders
                            .filter(o => o.payment_status === 'pending')
                            .map(o => ({ ...o, campaignName: campaign.name, campaignId: campaign.id }))
                        allOrders.push(...pendingOrders)
                    }
                }
                setOrders(allOrders.sort((a, b) =>
                    new Date(a.auto_cancel_at).getTime() - new Date(b.auto_cancel_at).getTime()
                ))
            }
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    async function sendReminder(orderId) {
        if (!confirm('Are you sure you want to send a payment reminder?')) return

        try {
            const response = await fetch('/api/draft-order/send-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preorder_id: orderId, shop })
            })
            const data = await response.json()
            if (data.success) {
                alert('Payment reminder sent successfully!')
                loadPendingOrders()
            } else {
                alert(data.error || 'Failed to send reminder')
            }
        } catch (error) {
            console.error('Failed to send reminder:', error)
            alert('Failed to send reminder')
        }
    }

    async function cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order? Inventory will be released.')) return

        try {
            const response = await fetch('/api/draft-order/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preorder_id: orderId, shop, reason: 'Manually cancelled' })
            })
            const data = await response.json()
            if (data.success) {
                alert('Order cancelled successfully')
                loadPendingOrders()
            } else {
                alert(data.error || 'Failed to cancel order')
            }
        } catch (error) {
            console.error('Failed to cancel order:', error)
            alert('Failed to cancel order')
        }
    }

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true

        const daysLeft = getDaysLeft(order.auto_cancel_at)
        if (filter === 'expiring_soon') return daysLeft <= 3 && daysLeft > 0
        if (filter === 'overdue') return daysLeft <= 0

        return true
    })

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
                    Pending Payments
                </h1>
                <p style={{ margin: 0, color: '#666' }}>
                    Manage all Pay Later pending payment orders
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '30px'
            }}>
                <SummaryCard
                    icon="📋"
                    title="Total Pending"
                    value={orders.length}
                    subtitle="All pending orders"
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                />
                <SummaryCard
                    icon="⏰"
                    title="Expiring Soon"
                    value={orders.filter(o => getDaysLeft(o.auto_cancel_at) <= 3 && getDaysLeft(o.auto_cancel_at) > 0).length}
                    subtitle="Due within 3 days"
                    color="#f59e0b"
                    active={filter === 'expiring_soon'}
                    onClick={() => setFilter('expiring_soon')}
                />
                <SummaryCard
                    icon="🚨"
                    title="Overdue"
                    value={orders.filter(o => getDaysLeft(o.auto_cancel_at) <= 0).length}
                    subtitle="Pending auto-cancel"
                    color="#ef4444"
                    active={filter === 'overdue'}
                    onClick={() => setFilter('overdue')}
                />
                <SummaryCard
                    icon="💰"
                    title="Total Amount"
                    value={`$${orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)}`}
                    subtitle="Pending revenue"
                />
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #e5e7eb'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                        {filter === 'all' ? 'No Pending Payments' : 'No Matching Orders'}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                        All orders have been paid or cancelled
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <Th>Customer</Th>
                                <Th>Campaign</Th>
                                <Th>Amount</Th>
                                <Th>Time Left</Th>
                                <Th>Reminder</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    onSendReminder={() => sendReminder(order.id)}
                                    onCancel={() => cancelOrder(order.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function SummaryCard({ icon, title, value, subtitle, color = '#2563eb', active, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                border: active ? `2px solid ${color}` : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s'
            }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color, marginBottom: '4px' }}>
                {value}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                {title}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {subtitle}
            </div>
        </div>
    )
}

function Th({ children }) {
    return (
        <th style={{
            textAlign: 'left',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {children}
        </th>
    )
}

function OrderRow({ order, onSendReminder, onCancel }) {
    const daysLeft = getDaysLeft(order.auto_cancel_at)
    const isExpiringSoon = daysLeft <= 3 && daysLeft > 0
    const isOverdue = daysLeft <= 0

    return (
        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '16px' }}>
                <div style={{ fontWeight: '500' }}>{order.customer_email}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {order.shopify_order_id}
                </div>
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ fontSize: '14px' }}>{order.campaignName}</div>
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>
                    ${order.total_amount}
                </div>
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: isOverdue ? '#fee2e2' : isExpiringSoon ? '#fef3c7' : '#e0f2fe',
                    color: isOverdue ? '#991b1b' : isExpiringSoon ? '#92400e' : '#075985'
                }}>
                    {isOverdue ? 'Overdue' : `${daysLeft} days`}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    {new Date(order.auto_cancel_at).toLocaleDateString('en-US')}
                </div>
            </td>
            <td style={{ padding: '16px' }}>
                {order.reminder_sent_at ? (
                    <div style={{ fontSize: '12px', color: '#059669' }}>
                        ✓ Sent<br />
                        <span style={{ color: '#9ca3af' }}>
                            {new Date(order.reminder_sent_at).toLocaleDateString('en-US')}
                        </span>
                    </div>
                ) : (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Not sent</div>
                )}
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={onSendReminder}
                        style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}>
                        Remind
                    </button>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}>
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    )
}

function getDaysLeft(autoCancelAt) {
    if (!autoCancelAt) return 999
    const now = new Date()
    const cancelDate = new Date(autoCancelAt)
    const diffTime = cancelDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}
