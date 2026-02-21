import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Profile } from './pages/Profile'
import { Recommendation } from './pages/Recommendation'
import { Risk } from './pages/Risk'
import { Market } from './pages/Market'
import { Schemes } from './pages/Schemes'
import { Chatbot } from './pages/Chatbot'
import { Reports } from './pages/Reports'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="recommendation" element={<Recommendation />} />
        <Route path="risk" element={<Risk />} />
        <Route path="market" element={<Market />} />
        <Route path="schemes" element={<Schemes />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
