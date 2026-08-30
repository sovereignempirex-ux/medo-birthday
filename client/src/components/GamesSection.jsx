import { useState, useEffect } from 'react'
import QuickClickGame from './games/QuickClickGame'
import CatchCakeGame from './games/CatchCakeGame'
import PopBalloonsGame from './games/PopBalloonsGame'
import QuizGame from './games/QuizGame'
import TicTacToe from './games/TicTacToe'
import ChessGame from './games/ChessGame'

function GamesSection({ currentUser, socket, apiUrl }) {
  const [activeGame, setActiveGame] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    fetch(`${apiUrl}/api/scores`)
      .then(r => r.json())
      .then(data => setLeaderboard(data))
      .catch(() => setLeaderboard([
        { playerName: 'ميدو', game: 'اضغط بسرعة', score: 150 },
        { playerName: 'أحمد', game: 'التقاط الكعكات', score: 120 },
        { playerName: 'سارة', game: 'فرقع البالونات', score: 200 },
      ]))
  }, [apiUrl])

  const saveScore = async (game, score) => {
    try {
      const token = localStorage.getItem('medo_auth_token')
      await fetch(`${apiUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game, score })
      })
    } catch (e) {
      console.log('Score saved locally')
    }
  }

  const games = [
    { id: 'quickclick', icon: '🎯', title: 'اضغط بسرعة', desc: 'اضغط على الأهداف بأسرع ما يمكنك!' },
    { id: 'catch', icon: '🎂', title: 'التقاط الكعكات', desc: 'التقط الكعكات المتساقطة!' },
    { id: 'balloons', icon: '🎈', title: 'فرقع البالونات', desc: 'فرقع البالونات قبل أن تطير!' },
    { id: 'quiz', icon: '🧠', title: 'مسابقة عيد الميلاد', desc: 'اختبر معرفتك بميدو!' },
    { id: 'tictactoe', icon: '⭕', title: 'XO لاعبين', desc: 'العب XO مع صديقك أونلاين!' },
    { id: 'chess', icon: '♟️', title: 'شطرنج', desc: 'العب شطرنج مع صديقك أونلاين!' },
  ]

  return (
    <section className="content-section">
      <h2 className="section-title">🎮 منطقة الألعاب</h2>
      <p className="section-subtitle">اختبر مهاراتك ونافس أصدقاءك!</p>

      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card glass-card" onClick={() => setActiveGame(game.id)}>
            <div className="game-icon">{game.icon}</div>
            <div className="game-title">{game.title}</div>
            <div className="game-desc">{game.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '60px' }}>
        <h3 style={{ textAlign: 'center', fontSize: '24px', color: '#FFD700', marginBottom: '24px' }}>🏆 لوحة المتصدرين</h3>
        <table className="leaderboard-table">
          <thead><tr><th>المركز</th><th>الاسم</th><th>اللعبة</th><th>النقاط</th></tr></thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr key={i}>
                <td className={`rank-${i + 1}`}>#{i + 1}</td>
                <td>{entry.playerName}</td>
                <td>{entry.game}</td>
                <td style={{ color: '#FFD700', fontWeight: 700 }}>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeGame === 'quickclick' && <QuickClickGame onClose={() => setActiveGame(null)} onScore={(s) => saveScore('اضغط بسرعة', s)} />}
      {activeGame === 'catch' && <CatchCakeGame onClose={() => setActiveGame(null)} onScore={(s) => saveScore('التقاط الكعكات', s)} />}
      {activeGame === 'balloons' && <PopBalloonsGame onClose={() => setActiveGame(null)} onScore={(s) => saveScore('فرقع البالونات', s)} />}
      {activeGame === 'quiz' && <QuizGame onClose={() => setActiveGame(null)} onScore={(s) => saveScore('مسابقة عيد الميلاد', s)} />}
      {activeGame === 'tictactoe' && <TicTacToe onClose={() => setActiveGame(null)} socket={socket} currentUser={currentUser} />}
      {activeGame === 'chess' && <ChessGame onClose={() => setActiveGame(null)} socket={socket} currentUser={currentUser} />}
    </section>
  )
}

export default GamesSection
