import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Interview from './pages/Interview'
import Feedback from './pages/Feedback'
import Dashboard from './pages/Dashboard'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<PrivateRoute><Setup /></PrivateRoute>} />
      <Route path="/interview/:sessionId" element={<PrivateRoute><Interview /></PrivateRoute>} />
      <Route path="/feedback/:sessionId" element={<PrivateRoute><Feedback /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    </Routes>
  )
}