import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/http'

function Stat({ title, value, hint }) {
  return (
    <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
      <div className="muted" style={{ fontSize: 13 }}>
        {title}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {hint ? (
        <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
          {hint}
        </div>
      ) : null}
    </div>
  )
}

export function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const completeness = useMemo(() => {
    if (!profile) return 0
    let total = 6
    let done = 0
    if (profile.latitude != null && profile.longitude != null) done++
    if (profile.soil_type) done++
    if (profile.ph != null) done++
    if (profile.nitrogen != null || profile.phosphorus != null || profile.potassium != null) done++
    if (profile.farm_size_acres != null) done++
    if (profile.season) done++
    return Math.round((done / total) * 100)
  }, [profile])

  useEffect(() => {
    let alive = true
    setLoading(true)
    apiFetch('/profile')
      .then((d) => {
        if (!alive) return
        setProfile(d.profile)
        setError('')
      })
      .catch((e) => {
        if (!alive) return
        setError(e.message || 'Failed to load profile')
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>Smart Dashboard</h2>
            <div className="muted" style={{ marginTop: 6 }}>
              A quick view of your farm profile and AI readiness.
            </div>
          </div>
          <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
            <div className="muted" style={{ fontSize: 12 }}>
              Profile completeness
            </div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{loading ? '…' : `${completeness}%`}</div>
          </div>
        </div>
        {error ? (
          <div style={{ marginTop: 12, color: 'rgba(255,77,79,0.95)' }}>{error}</div>
        ) : null}
      </div>

      <div className="grid cols-3">
        <Stat title="Location" value={profile?.latitude != null ? 'Saved' : 'Missing'} hint={profile?.location_name || ''} />
        <Stat title="Soil details" value={profile?.ph != null || profile?.soil_type ? 'Saved' : 'Missing'} hint={profile?.soil_type ? `Soil: ${profile.soil_type}` : ''} />
        <Stat title="Season" value={profile?.season || 'Not set'} hint="Used for recommendations." />
      </div>

      <div className="grid cols-2">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900 }}>What you can do next</div>
          <ul className="muted" style={{ marginTop: 10 }}>
            <li>Fill your location (GPS) and soil/farm profile.</li>
            <li>Get AI crop recommendations with confidence and rationale.</li>
            <li>Check crop risk prediction and suggested mitigations.</li>
            <li>Explore market prices and government schemes.</li>
            <li>Ask the farmer chatbot questions.</li>
            <li>Download a consolidated report.</li>
          </ul>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900 }}>Your stored profile (preview)</div>
          <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="muted">
            {loading ? 'Loading…' : JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

