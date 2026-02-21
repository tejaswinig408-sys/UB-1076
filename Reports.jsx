import { useState } from 'react'
import { downloadReport } from '../lib/http'

export function Reports() {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onDownload() {
    setStatus('')
    setError('')
    setLoading(true)
    try {
      await downloadReport()
      setStatus('Report downloaded.')
    } catch (e) {
      setError(e.message || 'Failed to download report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Downloadable Report</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Export your farm profile, AI recommendations, risk prediction, and market insights.
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 900 }}>KrishiRakshak AI Report</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Make sure your profile is complete first (Location + Soil/Farm details).
            </div>
          </div>
          <button className="btn primary" onClick={onDownload} disabled={loading}>
            {loading ? 'Preparing…' : 'Download report'}
          </button>
        </div>

        {status ? (
          <div style={{ marginTop: 12, fontSize: 13, background: 'rgba(18,185,129,0.10)', border: '1px solid rgba(18,185,129,0.25)', padding: 10, borderRadius: 12 }}>
            {status}
          </div>
        ) : null}
        {error ? (
          <div style={{ marginTop: 12, fontSize: 13, background: 'rgba(255,77,79,0.10)', border: '1px solid rgba(255,77,79,0.25)', padding: 10, borderRadius: 12 }}>
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}

