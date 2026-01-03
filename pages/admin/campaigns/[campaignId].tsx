import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CampaignDetailPage() {
    const router = useRouter()
    const { campaignId, shop } = router.query

    const [campaign, setCampaign] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('settings') // settings | products | orders
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (campaignId && shop) {
            loadCampaign()
        }
    }, [campaignId, shop])

    async function loadCampaign() {
        try {
            setLoading(true)
            const response = await fetch(`/api/campaigns/${campaignId}?shop=${shop}`)
            const data = await response.json()
            if (data.success) {
                setCampaign(data.campaign)
            }
        } catch (error) {
            console.error('Failed to load campaign:', error)
        } finally {
            setLoading(false)
        }
    }

    async function saveCampaign(updates) {
        try {
            setSaving(true)
            const response = await fetch(`/api/campaigns/${campaignId}?shop=${shop}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            const data = await response.json()
            if (data.success) {
                setCampaign(data.campaign)
                alert('Saved successfully!')
            }
        } catch (error) {
            console.error('Failed to save:', error)
            alert('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    async function deleteCampaign() {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`/api/campaigns/${campaignId}?shop=${shop}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (data.success) {
                alert('Campaign deleted successfully')
                router.push(`/admin/campaigns?shop=${shop}`)
            } else {
                alert(data.error || 'Failed to delete')
            }
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('Failed to delete')
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
            </div>
        )
    }

    if (!campaign) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', color: '#666' }}>Campaign not found</div>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <button
                    onClick={() => router.push(`/admin/campaigns?shop=${shop}`)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '12px',
                        padding: 0
                    }}>
                    ← Back to Campaigns
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
                            {campaign.name}
                        </h1>
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            ID: {campaign.id} · Created {new Date(campaign.created_at).toLocaleDateString('en-US')}
                        </div>
                    </div>
                    <button
                        onClick={deleteCampaign}
                        style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}>
                        Delete Campaign
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <Tab label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <Tab label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                    <Tab label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                </div>
            </div>

            {/* Content */}
            {activeTab === 'settings' && (
                <SettingsTab campaign={campaign} onSave={saveCampaign} saving={saving} />
            )}
            {activeTab === 'products' && (
                <ProductsTab campaign={campaign} onReload={loadCampaign} shop={shop} />
            )}
            {activeTab === 'orders' && (
                <OrdersTab campaign={campaign} shop={shop} />
            )}
        </div>
    )
}

function Tab({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                padding: '12px 24px',
                color: active ? '#2563eb' : '#6b7280',
                fontWeight: active ? '600' : '400',
                fontSize: '15px',
                cursor: 'pointer'
            }}>
            {label}
        </button>
    )
}

function SettingsTab({ campaign, onSave, saving }) {
    const [formData, setFormData] = useState({
        name: campaign.name,
        payment_mode: campaign.payment_mode,
        auto_cancel_days: campaign.auto_cancel_days,
        lock_inventory: campaign.lock_inventory,
        send_payment_reminder: campaign.send_payment_reminder,
        reminder_days_before_cancel: campaign.reminder_days_before_cancel,
        enabled: campaign.enabled
    })

    function handleSubmit(e) {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Campaign Name
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '15px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Payment Mode
                </label>
                <div style={{
                    padding: '12px 16px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '15px'
                }}>
                    {formData.payment_mode === 'pay_later' ? 'Pay Later' : 'Immediate Pay'}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                    Payment mode cannot be changed after creation
                </div>
            </div>

            {formData.payment_mode === 'pay_later' && (
                <>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Auto-cancel after: {formData.auto_cancel_days} days
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={formData.auto_cancel_days}
                            onChange={e => setFormData({ ...formData, auto_cancel_days: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                            Unpaid orders will be automatically cancelled after this many days
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.lock_inventory}
                                onChange={e => setFormData({ ...formData, lock_inventory: e.target.checked })}
                                style={{ marginRight: '8px', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: '500' }}>Lock inventory</span>
                        </label>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '6px', marginLeft: '26px' }}>
                            When enabled, inventory will be locked when Draft Order is created
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.send_payment_reminder}
                                onChange={e => setFormData({ ...formData, send_payment_reminder: e.target.checked })}
                                style={{ marginRight: '8px', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: '500' }}>Send payment reminders</span>
                        </label>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '6px', marginLeft: '26px' }}>
                            Send payment reminder email {formData.reminder_days_before_cancel} days before auto-cancel
                        </div>
                    </div>
                </>
            )}

            <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                        style={{ marginRight: '8px', width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: '500' }}>Enable campaign</span>
                </label>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '6px', marginLeft: '26px' }}>
                    When disabled, pre-order buttons will not be displayed on the storefront
                </div>
            </div>

            <button
                type="submit"
                disabled={saving}
                style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1
                }}>
                {saving ? 'Saving...' : 'Save Settings'}
            </button>
        </form>
    )
}

function ProductsTab({ campaign, onReload, shop }) {
    return (
        <div>
            <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                    Product Management
                </h3>
                <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
                    Use API to add products to this campaign
                </p>
                <code style={{
                    display: 'block',
                    background: '#1f2937',
                    color: '#10b981',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    textAlign: 'left',
                    whiteSpace: 'pre',
                    overflow: 'auto'
                }}>
                    {`POST /api/campaigns/${campaign.id}/products?shop=${shop}
{
  "products": [
    { "product_id": "123", "variant_id": "456" }
  ]
}`}
                </code>
                <div style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
                    Current linked products: <strong>{campaign.products?.length || 0}</strong>
                </div>
            </div>

            {campaign.products && campaign.products.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                        Linked Products
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {campaign.products.map(product => (
                            <div key={product.id} style={{
                                padding: '12px 16px',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>Product: {product.product_id}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>Variant: {product.variant_id || 'All'}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    {new Date(product.created_at).toLocaleDateString('en-US')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function OrdersTab({ campaign, shop }) {
    const orders = campaign.orders || []

    if (orders.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#f9fafb',
                borderRadius: '12px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                    No Orders Yet
                </h3>
                <p style={{ margin: 0, color: '#666' }}>
                    This campaign has not generated any orders yet
                </p>
            </div>
        )
    }

    return (
        <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Order List ({orders.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => (
                    <div key={order.id} style={{
                        padding: '16px',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                                <strong>{order.customer_email}</strong>
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                    Order: {order.shopify_order_id}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                                    ${order.total_amount}
                                </div>
                                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                                    <StatusBadge status={order.payment_status} />
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {new Date(order.created_at).toLocaleString('en-US')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const styles = {
        pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending' },
        paid: { bg: '#d1fae5', color: '#065f46', text: 'Paid' },
        cancelled: { bg: '#fee2e2', color: '#991b1b', text: 'Cancelled' }
    }

    const style = styles[status] || styles.pending

    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            background: style.bg,
            color: style.color
        }}>
            {style.text}
        </span>
    )
}
