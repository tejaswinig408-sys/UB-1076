import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/http'

export function Profile() {
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const [soilType, setSoilType] = useState('')
  const [ph, setPh] = useState('')
  const [n, setN] = useState('')
  const [p, setP] = useState('')
  const [k, setK] = useState('')
  const [farmSize, setFarmSize] = useState('')
  const [irrigation, setIrrigation] = useState('')
  const [season, setSeason] = useState('All')

  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/profile')
      .then((d) => {
        const pr = d.profile
        if (!pr) return
        setLocationName(pr.location_name || '')
        setLat(pr.latitude != null ? String(pr.latitude) : '')
        setLng(pr.longitude != null ? String(pr.longitude) : '')
        setSoilType(pr.soil_type || '')
        setPh(pr.ph != null ? String(pr.ph) : '')
        setN(pr.nitrogen != null ? String(pr.nitrogen) : '')
        setP(pr.phosphorus != null ? String(pr.phosphorus) : '')
        setK(pr.potassium != null ? String(pr.potassium) : '')
        setFarmSize(pr.farm_size_acres != null ? String(pr.farm_size_acres) : '')
        setIrrigation(pr.irrigation_type || '')
        setSeason(pr.season || 'All')
      })
      .catch(() => {})
  }, [])

  async function useGps() {
    setStatus('')
    setError('')
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
        setStatus('GPS coordinates captured. Click "Save location".')
      },
      () => setError('Unable to get GPS. Please allow location permission or enter manually.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  async function saveLocation() {
    setStatus('')
    setError('')
    try {
      await apiFetch('/profile/location', {
        method: 'POST',
        body: { latitude: Number(lat), longitude: Number(lng), location_name: locationName || null },
      })
      setStatus('Location saved.')
    } catch (e) {
      setError(e.message || 'Failed to save location')
    }
  }

  async function saveSoilFarm() {
    setStatus('')
    setError('')
    try {
      await apiFetch('/profile/soil-farm', {
        method: 'POST',
        body: {
          soil_type: soilType || null,
          ph: ph === '' ? null : Number(ph),
          nitrogen: n === '' ? null : Number(n),
          phosphorus: p === '' ? null : Number(p),
          potassium: k === '' ? null : Number(k),
          farm_size_acres: farmSize === '' ? null : Number(farmSize),
          irrigation_type: irrigation || null,
          season: season || null,
        },
      })
      setStatus('Soil & farm details saved.')
    } catch (e) {
      setError(e.message || 'Failed to save soil/farm details')
    }
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Soil & Farm Details Form</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Provide location and soil indicators to power recommendations and risk prediction.
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

      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Location-based input</div>
          <button className="btn" onClick={useGps}>
            Use GPS
          </button>
        </div>
        <div className="grid cols-3" style={{ marginTop: 12 }}>
          <div className="field" style={{ gridColumn: 'span 3' }}>
            <div className="label">Village / District (optional)</div>
            <input className="input" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Guntur, Andhra Pradesh" />
          </div>
          <div className="field">
            <div className="label">Latitude</div>
            <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="17.3850" />
          </div>
          <div className="field">
            <div className="label">Longitude</div>
            <input className="input" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="78.4867" />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="btn primary" onClick={saveLocation} disabled={!lat || !lng}>
              Save location
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 900 }}>Soil + Farm profile</div>
        <div className="grid cols-3" style={{ marginTop: 12 }}>
          <div className="field">
            <div className="label">Soil type</div>
            <input className="input" value={soilType} onChange={(e) => setSoilType(e.target.value)} placeholder="e.g., Loamy / Clay / Sandy" />
          </div>
          <div className="field">
            <div className="label">pH</div>
            <input className="input" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="0 - 14" />
          </div>
          <div className="field">
            <div className="label">Farm size (acres)</div>
            <input className="input" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} placeholder="e.g., 2.5" />
          </div>
          <div className="field">
            <div className="label">Nitrogen (N)</div>
            <input className="input" value={n} onChange={(e) => setN(e.target.value)} placeholder="ppm / kg/ha" />
          </div>
          <div className="field">
            <div className="label">Phosphorus (P)</div>
            <input className="input" value={p} onChange={(e) => setP(e.target.value)} placeholder="ppm / kg/ha" />
          </div>
          <div className="field">
            <div className="label">Potassium (K)</div>
            <input className="input" value={k} onChange={(e) => setK(e.target.value)} placeholder="ppm / kg/ha" />
          </div>
          <div className="field">
            <div className="label">Irrigation type</div>
            <input className="input" value={irrigation} onChange={(e) => setIrrigation(e.target.value)} placeholder="e.g., Canal / Borewell / Drip" />
          </div>
          <div className="field">
            <div className="label">Season</div>
            <select className="select" value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="All">All</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="btn primary" onClick={saveSoilFarm}>
              Save details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

