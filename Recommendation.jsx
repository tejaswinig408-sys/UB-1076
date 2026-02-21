import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/http'

export function Recommendation() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    apiFetch('/ai/recommendation')
      .then((d) => alive && (setData(d), setError('')))
      .catch((e) => alive && setError(e.message || 'Failed to load recommendations'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>AI Crop Recommendation</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Based on your season, soil indicators, and irrigation details.
        </div>
      </div>

      {loading ? (
        <div className="card">Loading…</div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'rgba(255,77,79,0.35)' }}>
          <div style={{ color: 'rgba(255,77,79,0.95)', fontWeight: 800 }}>Cannot generate recommendations</div>
          <div className="muted" style={{ marginTop: 6 }}>
            {error}
          </div>
          <div className="muted" style={{ marginTop: 10 }}>
            Go to <b>Soil & Farm Details</b> and save your location + soil profile first.
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 900 }}>Rationale</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {data?.rationale}
            </div>
          </div>
          <div className="grid cols-3">
            {data?.recommended_crops?.map((c) => (
              <div key={c.crop} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{c.crop}</div>
                  <div style={{ fontWeight: 900, color: 'rgba(18,185,129,0.95)' }}>{Math.round(c.confidence * 100)}%</div>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  {c.why}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

