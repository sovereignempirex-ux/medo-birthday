import { useState, useEffect } from 'react'

function PopBalloonsGame({ onClose, onScore }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [balloons, setBalloons] = useState([])
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('medo_game_balloons') || '0'))

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
        localStorage.setItem('medo_game_balloons', score.toString())
      }
      onScore(score)
    }
  }, [timeLeft, playing, score, highScore, onScore])

  useEffect(() => {
    if (!playing) return
    const spawnInterval = setInterval(() => {
      const emojis = ['🎈', '🎉', '🎊', '🎁', '⭐']
      setBalloons(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: Math.random() * 85 + 5,
        y: 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        speed: Math.random() * 1.5 + 0.5
      }])
    }, 600)
    return () => clearInterval(spawnInterval)
  }, [playing])

  useEffect(() => {
    if (!playing) return
    const gameLoop = setInterval(() => {
      setBalloons(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -10))
    }, 50)
    return () => clearInterval(gameLoop)
  }, [playing])

  const startGame = () => { setScore(0); setTimeLeft(30); setBalloons([]); setPlaying(true) }

  const popBalloon = (id) => {
    setBalloons(prev => prev.filter(b => b.id !== id))
    setScore(s => s + 10)
  }

  return (
    <div className="game-modal" onClick={onClose}>
      <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="game-close" onClick={onClose}>✕</button>
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>🎈 فرقع البالونات</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>فرقع أكبر عدد من البالونات قبل انتهاء الوقت!</p>
        <div className="score-display">النقاط: {score} | الأفضل: {highScore}</div>
        <div className="timer-display">⏱️ الوقت: {timeLeft} ثانية</div>
        {!playing && (
          <button className="start-game-btn" onClick={startGame}>
            {timeLeft === 0 ? '🔄 لعب مرة أخرى' : '🎮 ابدأ اللعب'}
          </button>
        )}
        <div className="catch-game-area" style={{ height: '300px' }}>
          {balloons.map(b => (
            <div key={b.id} className="balloon" style={{ left: `${b.x}%`, top: `${b.y}%` }} onClick={() => popBalloon(b.id)}>
              {b.emoji}
            </div>
          ))}
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

export default PopBalloonsGame
