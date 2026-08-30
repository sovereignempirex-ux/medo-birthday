import { useState } from 'react'

function QuizGame({ onClose, onScore }) {
  const questions = [
    { q: 'ما هو لون الكعكة المفضل لدى ميدو؟', options: ['شوكولاتة', 'فراولة', 'فانيليا', 'ليمون'], correct: 0 },
    { q: 'كم عمر ميدو في عيد ميلاده هذا؟', options: ['20', '21', '22', '23'], correct: 1 },
    { q: 'ما هي هواية ميدو المفضلة؟', options: ['القراءة', 'الرياضة', 'الألعاب', 'السفر'], correct: 2 },
    { q: 'ما هو الحيوان المفضل لدى ميدو؟', options: ['القط', 'الكلب', 'الأسد', 'النسر'], correct: 0 },
    { q: 'في أي شهر يحتفل ميدو بعيد ميلاده؟', options: ['يناير', 'أغسطس', 'سبتمبر', 'ديسمبر'], correct: 2 },
  ]
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selected, setSelected] = useState(null)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('medo_game_quiz') || '0'))

  const handleAnswer = (index) => {
    if (selected !== null) return
    setSelected(index)
    const newScore = score + (index === questions[currentQ].correct ? 20 : 0)
    if (index === questions[currentQ].correct) setScore(newScore)
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1)
        setSelected(null)
      } else {
        setShowResult(true)
        const finalScore = index === questions[currentQ].correct ? newScore : score
        if (finalScore > highScore) {
          setHighScore(finalScore)
          localStorage.setItem('medo_game_quiz', finalScore.toString())
        }
        onScore(finalScore)
      }
    }, 1000)
  }

  const restart = () => { setCurrentQ(0); setScore(0); setShowResult(false); setSelected(null) }

  return (
    <div className="game-modal" onClick={onClose}>
      <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="game-close" onClick={onClose}>✕</button>
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>🧠 مسابقة عيد الميلاد</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>اختبر معرفتك بميدو!</p>
        <div className="score-display">النقاط: {score} | الأفضل: {highScore}</div>

        {!showResult ? (
          <>
            <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>سؤال {currentQ + 1} من {questions.length}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{questions[currentQ].q}</div>
            </div>
            {questions[currentQ].options.map((opt, i) => (
              <button key={i} className={`quiz-option ${selected !== null ? (i === questions[currentQ].correct ? 'correct' : i === selected ? 'wrong' : '') : ''}`}
                onClick={() => handleAnswer(i)} disabled={selected !== null}>{opt}</button>
            ))}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
            <h3 style={{ fontSize: '28px', color: '#FFD700', marginBottom: '16px' }}>انتهت المسابقة!</h3>
            <p style={{ fontSize: '20px', color: '#fff', marginBottom: '24px' }}>مجموع نقاطك: {score} من {questions.length * 20}</p>
            <button className="start-game-btn" onClick={restart}>🔄 لعب مرة أخرى</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizGame
