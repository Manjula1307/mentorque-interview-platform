import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await api.get('/sessions/history')
        setSessions(res.data.sessions)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    loadSessions()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const scoreColor = (score) => {
    if (!score) return 'var(--text3)'
    if (score >= 8) return 'var(--green)'
    if (score >= 6) return 'var(--yellow)'
    return 'var(--red)'
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const completed = sessions.filter(s => s.status === 'completed')
  const scores = completed.filter(s => s.score).map(s => Number(s.score))
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null
  const bestScore = scores.length ? Math.max(...scores) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-300px', left: '30%',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '56px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', boxShadow: '0 0 20px var(--accent-glow)'
            }}>🎙</div>
            <span style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.5px' }}>
              Mentor<span style={{ color: 'var(--accent)' }}>que</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{user.email}</span>
            <button
              onClick={() => navigate('/setup')}
              style={{ width: 'auto', padding: '9px 18px', fontSize: '13px', borderRadius: '8px', fontWeight: '600' }}
            >
              + New Interview
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: 'auto', padding: '9px 18px', fontSize: '13px',
                background: 'var(--surface)', border: '1px solid var(--border2)',
                color: 'var(--text2)', borderRadius: '8px'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '8px' }}>
            Hey, <span style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #66e8ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>{user.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>
            {sessions.length === 0
              ? "Ready to nail your next interview? Let's start."
              : `${completed.length} interview${completed.length !== 1 ? 's' : ''} completed. Keep the momentum going.`
            }
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '40px' }}>
          {[
            { label: 'Total Sessions', value: sessions.length, color: 'var(--accent)', icon: '🎙' },
            { label: 'Average Score', value: avgScore ? `${avgScore}/10` : '—', color: 'var(--yellow)', icon: '📊' },
            { label: 'Best Score', value: bestScore ? `${bestScore}/10` : '—', color: 'var(--green)', icon: '🏆' }
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '24px',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`
              }} />
              <div style={{ fontSize: '20px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: s.color, letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sessions list */}
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Session History
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '60px', fontSize: '14px' }}>
              Loading sessions...
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px dashed var(--border2)',
              borderRadius: '20px', padding: '60px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎙</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>No sessions yet</h3>
              <p style={{ color: 'var(--text2)', marginBottom: '24px', fontSize: '14px' }}>
                Start your first mock interview to see your progress here
              </p>
              <button onClick={() => navigate('/setup')} style={{ width: 'auto', padding: '11px 24px', fontSize: '14px' }}>
                Start First Interview
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => session.status === 'completed'
                  ? navigate(`/feedback/${session.id}`)
                  : navigate(`/interview/${session.id}`)
                }
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '14px', padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'
                  e.currentTarget.style.background = 'rgba(0,212,255,0.03)'
                  e.currentTarget.style.transform = 'translateX(3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                {/* Score */}
                <div style={{
                  width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                  background: `${scoreColor(session.score)}12`,
                  border: `1px solid ${scoreColor(session.score)}30`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {session.score
                    ? <>
                        <span style={{ fontWeight: '800', color: scoreColor(session.score), fontSize: '16px', lineHeight: 1 }}>{session.score}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text3)', marginTop: '1px' }}>/10</span>
                      </>
                    : <span style={{ fontSize: '18px' }}>🎙</span>
                  }
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', letterSpacing: '-0.2px' }}>
                    {session.job_role}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {session.experience_level} · {formatDate(session.started_at)}
                  </div>
                </div>

                {/* Status pill */}
                <div style={{
                  padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                  background: session.status === 'completed' ? 'rgba(0,229,160,0.08)' : 'rgba(255,201,60,0.08)',
                  color: session.status === 'completed' ? 'var(--green)' : 'var(--yellow)',
                  border: `1px solid ${session.status === 'completed' ? 'rgba(0,229,160,0.2)' : 'rgba(255,201,60,0.2)'}`,
                  letterSpacing: '0.3px'
                }}>
                  {session.status === 'completed' ? '✓ Done' : '● Live'}
                </div>

                <div style={{ color: 'var(--text3)', fontSize: '16px' }}>›</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}