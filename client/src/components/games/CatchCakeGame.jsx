import { useState, useEffect, useRef } from 'react'

function CatchCakeGame({ onClose, onScore }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [basketX, setBasketX] = useState(50)
  const [cakes, setCakes] = useState([])
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('medo_game_catch') || '0'))
  const areaRef = useRef(null)

  useEffect(() => {
    if (!playing || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [playing, timeLeft])

  useEffect(() => {
    if (timeLeft <= 0 && playing) {
      setPlaying(false)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('medo_game_catch', score.toString())
      }
      onScore(score)
    }
  }, [timeLeft, playing, score, highScore, onScore])

  useEffect(() => {
    if (!playing) return
    const spawnInterval = setInterval(() => {
      setCakes(prev => [...prev, { id: Date.now() + Math.random(), x: Math.random() * 90 + 5, y: 0, speed: Math.random() * 2 + 1 }])
    }, 800)
    return () => clearInterval(spawnInterval)
  }, [playing])

  useEffect(() => {
    if (!playing) return
    const gameLoop = setInterval(() => {
      setCakes(prev => {
        const updated = prev.map(c => ({ ...c, y: c.y + c.speed })).filter(c => c.y < 100)
        updated.forEach(c => {
          if (c.y > 85 && Math.abs(c.x - basketX) < 15) {
            setScore(s => s + 5)
            c.caught = true
          }
        })
        return updated.filter(c => !c.caught)
      })
    }, 50)
    return () => clearInterval(gameLoop)
  }, [playing, basketX])

  const startGame = () => { setScore(0); setTimeLeft(30); setCakes([]); setPlaying(true) }

  const handleMouseMove = (e) => {
    if (!areaRef.current || !playing) return
    const rect = areaRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setBasketX(Math.max(10, Math.min(90, x)))
  }

  return (
    <div className="game-modal" onClick={onClose}>
      <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="game-close" onClick={onClose}>✕</button>
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>🎂 التقاط الكعكات</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>حرك الفأرة لتحريك السلة والتقاط الكعكات!</p>
        <div className="score-display">النقاط: {score} | الأفضل: {highScore}</div>
        <div className="timer-display">⏱️ الوقت: {timeLeft} ثانية</div>
        {!playing && (
          <button className="start-game-btn" onClick={startGame}>
            {timeLeft === 0 ? '🔄 لعب مرة أخرى' : '🎮 ابدأ اللعب'}
          </button>
        )}
        <div ref={areaRef} className="catch-game-area" onMouseMove={handleMouseMove}>
          {cakes.map(cake => (
            <div key={cake.id} className="cake-falling" style={{ left: `${cake.x}%`, top: `${cake.y}%` }}>🎂</div>
          ))}
          <div className="basket" style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}>🧺</div>
        </div>
        {timeLeft === 0 && !playing && (
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '20px', color: '#FFD700' }}>
            🎉 انتهى الوقت! مجموع نقاطك: {score}
          </div>
        )}
      </div>
    </div>
  )
}

export default CatchCakeGame
