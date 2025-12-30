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
            // 查询所有待付款订单
            const response = await fetch(`/api/campaigns?shop=${shop}`)
            const data = await response.json()

            if (data.success) {
                // 从所有活动中提取待付款订单
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
        if (!confirm('确定要发送催款提醒吗？')) return

        try {
            const response = await fetch('/api/draft-order/send-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preorder_id: orderId, shop })
            })
            const data = await response.json()
            if (data.success) {
                alert('催款提醒已发送！')
                loadPendingOrders()
            } else {
                alert(data.error || '发送失败')
            }
        } catch (error) {
            console.error('Failed to send reminder:', error)
            alert('发送失败')
        }
    }

    async function cancelOrder(orderId) {
        if (!confirm('确定要取消这个订单吗？库存将被释放。')) return

        try {
            const response = await fetch('/api/draft-order/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preorder_id: orderId, shop, reason: '手动取消' })
            })
            const data = await response.json()
            if (data.success) {
                alert('订单已取消')
                loadPendingOrders()
            } else {
                alert(data.error || '取消失败')
            }
        } catch (error) {
            console.error('Failed to cancel order:', error)
            alert('取消失败')
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
                <div style={{ fontSize: '16px', color: '#666' }}>加载中...</div>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600' }}>
                    待付款订单
                </h1>
                <p style={{ margin: 0, color: '#666' }}>
                    管理所有 Pay Later 模式的待付款订单
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
                    title="总待付款"
                    value={orders.length}
                    subtitle="所有待付款订单"
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                />
                <SummaryCard
                    icon="⏰"
                    title="即将过期"
                    value={orders.filter(o => getDaysLeft(o.auto_cancel_at) <= 3 && getDaysLeft(o.auto_cancel_at) > 0).length}
                    subtitle="3天内到期"
                    color="#f59e0b"
                    active={filter === 'expiring_soon'}
                    onClick={() => setFilter('expiring_soon')}
                />
                <SummaryCard
                    icon="🚨"
                    title="已逾期"
                    value={orders.filter(o => getDaysLeft(o.auto_cancel_at) <= 0).length}
                    subtitle="待自动取消"
                    color="#ef4444"
                    active={filter === 'overdue'}
                    onClick={() => setFilter('overdue')}
                />
                <SummaryCard
                    icon="💰"
                    title="总金额"
                    value={`¥${orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)}`}
                    subtitle="待收金额"
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
                        {filter === 'all' ? '暂无待付款订单' : '没有符合条件的订单'}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                        所有订单都已付款或取消
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
                                <Th>客户</Th>
                                <Th>活动</Th>
                                <Th>金额</Th>
                                <Th>剩余时间</Th>
                                <Th>催款</Th>
                                <Th>操作</Th>
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
                    ¥{order.total_amount}
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
                    {isOverdue ? '已逾期' : `${daysLeft} 天`}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    {new Date(order.auto_cancel_at).toLocaleDateString('zh-CN')}
                </div>
            </td>
            <td style={{ padding: '16px' }}>
                {order.reminder_sent_at ? (
                    <div style={{ fontSize: '12px', color: '#059669' }}>
                        ✓ 已发送<br />
                        <span style={{ color: '#9ca3af' }}>
                            {new Date(order.reminder_sent_at).toLocaleDateString('zh-CN')}
                        </span>
                    </div>
                ) : (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>未发送</div>
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
                        催款
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
                        取消
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
