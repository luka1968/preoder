import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Stats {
  overview: {
    total_preorder_products: number
    active_manual_preorders: number
    active_auto_preorders: number
    out_of_stock_products: number
  }
  orders: {
    today_count: number
    today_revenue: number
    total_count: number
    pending_shipment: number
  }
  health: {
    webhooks_healthy: boolean
    total_webhooks: number
    unhealthy_webhooks: number
    recent_errors_count: number
  }
  alerts: any[]
}

export default function DashboardPage() {
  const [shop, setShop] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      const [statsRes, trendsRes] = await Promise.all([
        fetch(`/api/dashboard/stats?shop=${shopDomain}`),
        fetch(`/api/dashboard/trends?shop=${shopDomain}&days=30`)
      ])

      const statsData = await statsRes.json()
      const trendsData = await trendsRes.json()

      setStats(statsData.stats)
      setTrends(trendsData.trends)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1>PreOrder Pro Dashboard</h1>
        <div className="quick-actions">
          <button onClick={() => window.location.href = `/admin/products?shop=${shop}`}>
            Manage Products
          </button>
          <button onClick={() => window.location.href = `/admin/settings?shop=${shop}`}>
            Settings
          </button>
        </div>
      </header>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="alerts">
          {stats.alerts.map((alert, i) => (
            <div key={i} className={`alert alert-${alert.severity}`}>
              <span className="alert-icon">⚠️</span>
              <div>
                <strong>{alert.message}</strong>
                <p>{alert.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Pre-order Products</h3>
            <p className="card-value">{stats.overview.total_preorder_products}</p>
            <span className="card-subtitle">
              {stats.overview.active_manual_preorders} manual + {stats.overview.active_auto_preorders} auto
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">🛒</div>
          <div className="card-content">
            <h3>Today's Orders</h3>
            <p className="card-value">{stats.orders.today_count}</p>
            <span className="card-subtitle">
              ${stats.orders.today_revenue.toFixed(2)} revenue
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total Pre-orders</h3>
            <p className="card-value">{stats.orders.total_count}</p>
            <span className="card-subtitle">
              {stats.orders.pending_shipment} pending shipment
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">{stats.health.webhooks_healthy ? '✅' : '❌'}</div>
          <div className="card-content">
            <h3>System Health</h3>
            <p className="card-value">{stats.health.webhooks_healthy ? 'Healthy' : 'Issues'}</p>
            <span className="card-subtitle">
              {stats.health.unhealthy_webhooks > 0 && `${stats.health.unhealthy_webhooks} webhook issues`}
              {stats.health.recent_errors_count > 0 && ` · ${stats.health.recent_errors_count} errors`}
            </span>
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      {trends && (
        <div className="chart-section">
          <h2>30-Day Trends</h2>
          <div className="chart-container">
            <Line
              data={trends}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="links-grid">
          <a href={`/admin/inventory?shop=${shop}`} className="link-card">
            <span className="link-icon">📋</span>
            <strong>View Out of Stock</strong>
            <p>{stats.overview.out_of_stock_products} products</p>
          </a>

          <a href={`/admin/orders?shop=${shop}`} className="link-card">
            <span className="link-icon">📦</span>
            <strong>Pending Orders</strong>
            <p>{stats.orders.pending_shipment} to ship</p>
          </a>

          <a href={`/admin/logs?shop=${shop}`} className="link-card">
            <span className="link-icon">🔍</span>
            <strong>View Logs</strong>
            <p>Recent activity</p>
          </a>

          <a href={`/admin/webhooks?shop=${shop}`} className="link-card">
            <span className="link-icon">🔗</span>
            <strong>Webhook Status</strong>
            <p>{stats.health.total_webhooks} registered</p>
          </a>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        h1 {
          color: #1a202c;
          font-size: 32px;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
        }

        .quick-actions button {
          padding: 10px 20px;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .alerts {
          margin-bottom: 24px;
        }

        .alert {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .alert-high {
          background: #fed7d7;
          border-left: 4px solid #f56565;
        }

        .alert-medium {
          background: #feebc8;
          border-left: 4px solid #ed8936;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          gap: 16px;
        }

        .card-icon {
          font-size: 48px;
        }

        .card-content h3 {
          color: #718096;
          font-size: 14px;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .card-value {
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .card-subtitle {
          color: #a0aec0;
          font-size: 14px;
        }

        .chart-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .chart-section h2 {
          color: #2d3748;
          margin-bottom: 24px;
        }

        .chart-container {
          height: 300px;
        }

        .quick-links h2 {
          color: #2d3748;
          margin-bottom: 16px;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .link-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .link-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #4299e1;
        }

        .link-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 12px;
        }

        .link-card strong {
          display: block;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .link-card p {
          color: #718096;
          font-size: 14px;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          font-size: 18px;
          color: #718096;
        }
      `}</style>
    </div>
  )
}
