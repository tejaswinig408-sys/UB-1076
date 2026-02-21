import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/http'
import { setAuth } from '../lib/auth'
import { Logo } from '../components/Logo'

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch('/auth/register', { method: 'POST', auth: false, body: { name, email, password } })
      setAuth(data)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '52px 0' }}>
      <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: 22 }}>
        <Logo />
        <h2 style={{ marginTop: 16, marginBottom: 6 }}>Create account</h2>
        <div className="muted">Start using smart agriculture features in minutes.</div>

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 16 }}>
          <div className="field">
            <div className="label">Full name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@example.com" />
          </div>
          <div className="field">
            <div className="label">Password</div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          {error ? (
            <div style={{ color: 'rgba(255,77,79,0.95)', fontSize: 13, background: 'rgba(255,77,79,0.10)', border: '1px solid rgba(255,77,79,0.25)', padding: 10, borderRadius: 12 }}>
              {error}
            </div>
          ) : null}
          <button className="btn primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Already have an account? <Link to="/login" style={{ textDecoration: 'underline' }}>Login</Link>
        </div>
      </div>
    </div>
  )
}

