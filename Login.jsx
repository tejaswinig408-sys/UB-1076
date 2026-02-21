import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/http'
import { setAuth } from '../lib/auth'
import { Logo } from '../components/Logo'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', auth: false, body: { email, password } })
      setAuth(data)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '52px 0' }}>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: 22 }}>
        <Logo />
        <h2 style={{ marginTop: 16, marginBottom: 6 }}>Login</h2>
        <div className="muted">Access your smart agriculture dashboard.</div>

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 16 }}>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@example.com" />
          </div>
          <div className="field">
            <div className="label">Password</div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error ? (
            <div style={{ color: 'rgba(255,77,79,0.95)', fontSize: 13, background: 'rgba(255,77,79,0.10)', border: '1px solid rgba(255,77,79,0.25)', padding: 10, borderRadius: 12 }}>
              {error}
            </div>
          ) : null}
          <button className="btn primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          New here? <Link to="/register" style={{ textDecoration: 'underline' }}>Create an account</Link>
        </div>
      </div>
    </div>
  )
}

