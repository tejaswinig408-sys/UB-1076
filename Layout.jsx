import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { clearAuth, getAuth } from '../lib/auth'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/profile', label: 'Soil & Farm Details' },
  { to: '/app/recommendation', label: 'AI Crop Recommendation' },
  { to: '/app/risk', label: 'Crop Risk Prediction' },
  { to: '/app/market', label: 'Market Prices' },
  { to: '/app/schemes', label: 'Gov Schemes' },
  { to: '/app/chatbot', label: 'Farmer Chatbot' },
  { to: '/app/reports', label: 'Report' },
]

export function Layout() {
  const navigate = useNavigate()
  const auth = getAuth()

  return (
    <div>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          background: 'rgba(5,8,20,0.65)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <Link to="/" aria-label="Go to home">
            <Logo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {auth?.user ? (
              <>
                <div className="muted" style={{ fontSize: 13 }}>
                  Signed in as <b style={{ color: 'rgba(255,255,255,0.9)' }}>{auth.user.name}</b>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    clearAuth()
                    navigate('/login')
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn" to="/login">
                  Login
                </Link>
                <Link className="btn primary" to="/register">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, padding: '18px 0 34px' }}>
        <aside className="card" style={{ padding: 14, alignSelf: 'start' }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Navigation</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                style={({ isActive }) => ({
                  padding: '10px 10px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: isActive ? 'rgba(18,185,129,0.16)' : 'rgba(255,255,255,0.04)',
                })}
              >
                {it.label}
              </NavLink>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
            Tip: fill Location + Soil/Farm details first to unlock AI insights.
          </div>
        </aside>

        <main style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

