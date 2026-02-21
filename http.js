import { CONFIG } from './config'
import { getToken } from './auth'

async function parseJsonSafe(res) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return { detail: text }
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${CONFIG.FASTAPI_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function downloadReport() {
  const token = getToken()
  const res = await fetch(`${CONFIG.REPORT_BASE}/report/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const data = await parseJsonSafe(res)
    throw new Error(data?.detail || `Download failed (${res.status})`)
  }
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'krishirakshak_ai_report.html'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

