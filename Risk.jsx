import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/http'

function levelColor(level) {
  if (level === 'High') return 'rgba(255,77,79,0.95)'
  if (level === 'Medium') return 'rgba(255,196,0,0.95)'
  return 'rgba(18,185,129,0.95)'
}

export function Risk() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    apiFetch('/ai/risk')
      .then((d) => alive && (setData(d), setError('')))
      .catch((e) => alive && setError(e.message || 'Failed to load risk'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Crop Risk Prediction</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Starter baseline scoring using your soil indicators and rough location context.
        </div>
      </div>

      {loading ? (
        <div className="card">Loading…</div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'rgba(255,77,79,0.35)' }}>
          <div style={{ color: 'rgba(255,77,79,0.95)', fontWeight: 800 }}>Cannot predict risk</div>
          <div className="muted" style={{ marginTop: 6 }}>
            {error}
          </div>
        </div>
      ) : (
        <>
          <div className="grid cols-3">
            <div className="card" style={{ padding: 16 }}>
              <div className="muted" style={{ fontSize: 13 }}>
                Risk level
              </div>
              <div style={{ fontWeight: 900, fontSize: 26, color: levelColor(data.risk_level), marginTop: 6 }}>{data.risk_level}</div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="muted" style={{ fontSize: 13 }}>
                Risk score (0–1)
              </div>
              <div style={{ fontWeight: 900, fontSize: 26, marginTop: 6 }}>{data.risk_score.toFixed(2)}</div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="muted" style={{ fontSize: 13 }}>
                Top risks
              </div>
              <div style={{ fontWeight: 800, marginTop: 8 }}>{data.top_risks.join(', ')}</div>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900 }}>Mitigation suggestions</div>
            <ul className="muted" style={{ marginTop: 10 }}>
              {data.mitigation.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

