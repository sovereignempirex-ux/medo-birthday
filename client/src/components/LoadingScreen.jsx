import { useState, useEffect } from 'react'

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return p + 2
      })
    }, 50)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <div className="loading-text">جاري تحضير الاحتفال</div>
      <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '20px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(135deg,#FFD700,#FFA500,#FF6347)', borderRadius: '2px', transition: 'width 0.1s ease' }}></div>
      </div>
      <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{progress}%</div>
    </div>
  )
}

export default LoadingScreen
