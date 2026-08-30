import ParticlesBackground from './ParticlesBackground'

function HeroSection() {
  return (
    <section className="hero-section">
      <ParticlesBackground />
      <div className="animate-fade-in-up">
        <div style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', marginBottom: '16px' }} className="animate-float">🎉</div>
        <h1 className="hero-name text-3d">MEDO</h1>
        <p className="hero-subtitle animate-float-slow">عيد ميلاد سعيد يا أروع صديق في الدنيا! 🎂👑</p>
      </div>
      <div style={{ position: 'absolute', bottom: '40px', animation: 'bounce-in 1s ease-out 1s both' }}>
        <div style={{ width: '30px', height: '50px', border: '2px solid rgba(255,215,0,0.5)', borderRadius: '15px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '4px', height: '10px', background: '#FFD700', borderRadius: '2px', marginTop: '8px', animation: 'float 1.5s ease-in-out infinite' }}></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
