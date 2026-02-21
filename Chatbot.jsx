import { useMemo, useState } from 'react'
import { apiFetch } from '../lib/http'

export function Chatbot() {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', text: 'Hi! I’m KrishiRakshak AI. Ask me about crops, soil, schemes, prices, or risk.' },
  ])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const canSend = useMemo(() => text.trim().length > 0 && !loading, [text, loading])

  async function send() {
    const content = text.trim()
    if (!content) return
    setText('')
    setMessages((m) => [...m, { role: 'user', text: content }])
    setLoading(true)
    try {
      const res = await apiFetch('/chat', { method: 'POST', body: { message: content } })
      setMessages((m) => [...m, { role: 'assistant', text: res.reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: `Sorry — ${e.message || 'something went wrong'}.` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Farmer Chatbot</h2>
        <div className="muted" style={{ marginTop: 6 }}>
          Ask questions in simple language; responses are tailored to the platform features.
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ height: 420, overflow: 'auto', display: 'grid', gap: 10, padding: 4 }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: 760,
                  padding: '10px 12px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: m.role === 'user' ? 'rgba(18,185,129,0.16)' : 'rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 4, opacity: 0.9 }}>{m.role === 'user' ? 'You' : 'KrishiRakshak AI'}</div>
                <div className="muted" style={{ color: 'rgba(255,255,255,0.86)' }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading ? <div className="muted">Thinking…</div> : null}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Try: "Which crop is best for Kharif with pH 6.8?"'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <button className="btn primary" onClick={send} disabled={!canSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

