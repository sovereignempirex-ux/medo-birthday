import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import ParticlesBackground from './ParticlesBackground'
import Fireworks from './Fireworks'

function CakeSection({ onComplete }) {
  const [candlesLit, setCandlesLit] = useState([true, true, true])
  const [smokeVisible, setSmokeVisible] = useState([false, false, false])
  const [countdown, setCountdown] = useState(15)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [darkened, setDarkened] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          setDarkened(true)
          setTimeout(() => {
            setCandlesLit([false, false, false])
            setSmokeVisible([true, true, true])
            setTimeout(() => {
              setShowExplosion(true)
              setShowMessage(true)
              setTimeout(() => onComplete(), 3000)
            }, 2000)
          }, 1000)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    if (showExplosion) {
      const duration = 3000
      const end = Date.now() + duration
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#FF69B4', '#8B5CF6'] })
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#FF69B4', '#8B5CF6'] })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [showExplosion])

  return (
    <section className="cake-section" style={{ transition: 'filter 2s ease', filter: darkened && !showExplosion ? 'brightness(0.3)' : 'brightness(1)' }}>
      <ParticlesBackground />
      <Fireworks active={showExplosion} />
      <h2 className="section-title" style={{ marginBottom: '8px' }}>🎂 كعكة عيد الميلاد</h2>
      <p className="section-subtitle">انطفئ الشموع بعد {countdown} ثانية...</p>

      <div className="cake-3d">
        <div className="cake-base"></div>
        <div className="cake-top">
          <div className="frosting">
            {[...Array(5)].map((_, i) => <div key={i} className="frosting-dot"></div>)}
          </div>
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="candle" style={{ left: i === 0 ? '35%' : i === 1 ? '50%' : '65%', transform: i === 1 ? 'translateX(-50%)' : 'none' }}>
            <div className={`flame ${!candlesLit[i] ? 'out' : ''}`}></div>
            <div className={`smoke ${smokeVisible[i] ? 'visible' : ''}`}></div>
          </div>
        ))}
      </div>

      <div className="countdown-display">{countdown}</div>

      {showMessage && (
        <div className="animate-bounce-in" style={{ textAlign: 'center', zIndex: 10 }}>
          <h1 className="birthday-title shimmer-text">🎉 HAPPY BIRTHDAY MEDO! 🎂</h1>
          <p className="birthday-wish">
            كل سنة وأنت طيب يا ميدو ❤️<br/>
            أتمنى تكون السنة الجديدة مليئة بالمغامرات والنجاحات واللحظات الجميلة.
          </p>
        </div>
      )}
    </section>
  )
}

export default CakeSection
