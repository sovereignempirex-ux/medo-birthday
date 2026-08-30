import { useState, useEffect, useRef } from 'react'

function QuickClickGame({ onClose, onScore }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [target, setTarget] = useState({ x: 50, y: 50, emoji: '🎯' })
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('medo_game_quickclick') || '0'))
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
        localStorage.setItem('medo_game_quickclick', score.toString())
      }
      onScore(score)
    }
  }, [timeLeft, playing, score, highScore, onScore])

  const startGame = () => { setScore(0); setTimeLeft(30); setPlaying(true); moveTarget() }

  const moveTarget = () => {
    if (!areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    const emojis = ['🎯', '🎂', '🎁', '🎈', '⭐', '💎']
    setTarget({
      x: Math.random() * (rect.width - 60) + 10,
      y: Math.random() * (rect.height - 60) + 10,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    })
  }

  const handleClick = () => { setScore(s => s + 10); moveTarget() }

  return (
    <div className="game-modal" onClick={onClose}>
      <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="game-close" onClick={onClose}>✕</button>
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>🎯 اضغط بسرعة!</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>اضغط على الأهداف التي تظهر بأسرع ما يمكنك!</p>
        <div className="score-display">النقاط: {score} | الأفضل: {highScore}</div>
        <div className="timer-display">⏱️ الوقت: {timeLeft} ثانية</div>
        {!playing && (
          <button className="start-game-btn" onClick={startGame}>
            {timeLeft === 0 ? '🔄 لعب مرة أخرى' : '🎮 ابدأ اللعب'}
          </button>
        )}
        <div ref={areaRef} className="quick-click-area" onClick={e => e.stopPropagation()}>
          {playing && (
            <div className="click-target" style={{ left: target.x, top: target.y }} onClick={handleClick}>
              {target.emoji}
            </div>
          )}
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

export default QuickClickGame
