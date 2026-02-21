import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/http'

export function Market() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    apiFetch('/insights/market-prices')
      .then((d) => alive && (setItems(d.items || []), setError('')))
      .catch((e) => alive && setError(e.message || 'Failed to load market prices'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Market Price Insights</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Sample prices (replaceable with real data integration).
        </div>
      </div>

      {loading ? (
        <div className="card">Loading…</div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'rgba(255,77,79,0.35)' }}>
          <div style={{ color: 'rgba(255,77,79,0.95)', fontWeight: 800 }}>{error}</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 18 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="muted" style={{ textAlign: 'left' }}>
                  <th style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>Commodity</th>
                  <th style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>Market</th>
                  <th style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>Price (₹/quintal)</th>
                  <th style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>Trend</th>
                  <th style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <b>{i.commodity}</b>
                    </td>
                    <td style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{i.market}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{i.price_inr_per_quintal}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{i.trend}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="muted">
                      {String(i.updated_at).slice(0, 19).replace('T', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

