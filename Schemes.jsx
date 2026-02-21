import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/http'

export function Schemes() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    apiFetch('/insights/schemes')
      .then((d) => alive && (setItems(d.items || []), setError('')))
      .catch((e) => alive && setError(e.message || 'Failed to load schemes'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Government Schemes</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Explore key schemes and how to apply.
        </div>
      </div>

      {loading ? (
        <div className="card">Loading…</div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'rgba(255,77,79,0.35)' }}>
          <div style={{ color: 'rgba(255,77,79,0.95)', fontWeight: 800 }}>{error}</div>
        </div>
      ) : (
        <div className="grid cols-2">
          {items.map((s) => (
            <div key={s.title} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{s.title}</div>
              <div className="muted" style={{ marginTop: 10 }}>
                <b>Eligibility:</b> {s.eligibility}
              </div>
              <div className="muted" style={{ marginTop: 8 }}>
                <b>Benefits:</b> {s.benefits}
              </div>
              <div className="muted" style={{ marginTop: 8 }}>
                <b>How to apply:</b> {s.how_to_apply}
              </div>
              {s.official_link ? (
                <a className="btn" href={s.official_link} target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
                  Official link
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

