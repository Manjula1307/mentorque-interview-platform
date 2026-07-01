import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Background glow effects */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-200px', right: '-100px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,153,204,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 48px',
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: 'auto', padding: '9px 20px', fontSize: '14px',
              background: 'transparent', border: '1px solid var(--border2)',
              color: 'var(--text2)', borderRadius: '8px'
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{ width: 'auto', padding: '9px 20px', fontSize: '14px', borderRadius: '8px' }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', padding: '100px 24px 80px',
        maxWidth: '900px', margin: '0 auto'
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '100px', padding: '6px 16px', marginBottom: '32px'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
            AI-Powered Voice Interview Practice
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: '900',
          letterSpacing: '-3px', lineHeight: '1.05', marginBottom: '24px'
        }}>
          Practice interviews<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #66e8ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            that talk back.
          </span>
        </h1>

        <p style={{
          fontSize: '18px', color: 'var(--text2)', lineHeight: '1.7',
          maxWidth: '560px', margin: '0 auto 40px', fontWeight: '400'
        }}>
          Have a real voice conversation with an AI interviewer. It listens to what you actually say, asks follow-ups, pushes back on weak answers, and gives you detailed feedback.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              width: 'auto', padding: '15px 32px', fontSize: '16px',
              borderRadius: '12px', fontWeight: '700'
            }}
          >
            Start practicing free →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: 'auto', padding: '15px 32px', fontSize: '16px',
              background: 'var(--surface)', border: '1px solid var(--border2)',
              color: 'var(--text)', borderRadius: '12px'
            }}
          >
            Log in
          </button>
        </div>

        {/* Social proof */}
        <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text3)' }}>
          No credit card · Works in Chrome · 100% free
        </p>
      </div>

      {/* Mock interview UI preview */}
      <div style={{
        maxWidth: '860px', margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 0 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}>
          {/* Fake browser bar */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
              height: '20px', marginLeft: '8px'
            }} />
          </div>

          {/* Mock conversation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { speaker: 'ai', text: "Hi, I'm Alex. You're interviewing for a Frontend Developer role. Tell me about a time you had to debug a complex issue under pressure. What was the situation?" },
              { speaker: 'user', text: "Sure — during my internship, our production app started throwing errors 30 minutes before a client demo..." },
              { speaker: 'ai', text: "That sounds stressful. What specific steps did YOU take to identify the root cause? Walk me through your debugging process." },
            ].map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.speaker === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '72%',
                  background: msg.speaker === 'user'
                    ? 'rgba(0, 212, 255, 0.08)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${msg.speaker === 'user' ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`,
                  borderRadius: msg.speaker === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: '11px', color: msg.speaker === 'user' ? 'var(--accent)' : 'var(--text3)', marginBottom: '5px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    {msg.speaker === 'user' ? '👤 YOU' : '🤖 ALEX · AI INTERVIEWER'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Listening indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)',
                borderRadius: '100px', padding: '8px 20px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
                <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: '600' }}>Listening to you...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '48px' }}>
          Built different from quiz apps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '🎤', title: 'Real voice conversation', desc: 'Speak naturally. The AI listens, understands, and responds — just like a real interviewer.' },
            { icon: '🧠', title: 'Adapts to your answers', desc: 'Gives follow-ups on vague answers, challenges weak ones, acknowledges strong ones.' },
            { icon: '📊', title: 'Detailed feedback report', desc: 'Get scored on communication, content, confidence, and STAR method usage after every session.' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px', padding: '28px',
              transition: 'border-color 0.2s'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px', letterSpacing: '-0.3px' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '24px', padding: '48px 60px'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>
            Ready to practice?
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: '28px', fontSize: '15px' }}>
            Set up your profile, pick a role, and start your first AI interview in under 2 minutes.
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{ width: 'auto', padding: '14px 36px', fontSize: '15px', borderRadius: '10px' }}
          >
            Create free account →
          </button>
        </div>
      </div>
    </div>
  )
}