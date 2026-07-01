import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="auth-container">
      
      <div className="auth-box">
       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
  <div style={{
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', boxShadow: '0 0 20px var(--accent-glow)'
  }}>🎙</div>
  <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px' }}>
    Mentor<span style={{ color: 'var(--accent)' }}>que</span>
  </span>
</div>
        <h1>Welcome back</h1>
        <p>Log in to continue practicing</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  )
}