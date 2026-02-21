import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function Landing() {
  return (
    <div className="container" style={{ padding: '52px 0 64px' }}>
      <div className="card" style={{ padding: 26 }}>
        <Logo size={44} />
        <h1 style={{ margin: '18px 0 10px', fontSize: 40, letterSpacing: -0.6 }}>Smart Agriculture & AgriTech Platform</h1>
        <p className="muted" style={{ marginTop: 0, fontSize: 16, maxWidth: 860 }}>
          KrishiRakshak AI helps farmers make data-driven decisions with location-based inputs, soil & farm profiling, AI crop
          recommendations, crop risk prediction, market insights, government schemes, and a farmer-friendly chatbot.
        </p>

        <div className="grid cols-3" style={{ marginTop: 16 }}>
          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ fontWeight: 900 }}>Location-based input</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Use GPS coordinates to personalize recommendations.
            </div>
          </div>
          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ fontWeight: 900 }}>AI + Risk prediction</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Starter ML baseline with transparent rationale and mitigation.
            </div>
          </div>
          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ fontWeight: 900 }}>Downloadable report</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Export your profile and AI insights in a single report.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <Link className="btn primary" to="/register">
            Get started
          </Link>
          <Link className="btn" to="/login">
            Login
          </Link>
          <Link className="btn" to="/app/dashboard">
            Open dashboard
          </Link>
        </div>
      </div>

      <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
        Note: Market prices and schemes are currently sample data (integration hooks are included in the backend).
      </div>
    </div>
  )
}

