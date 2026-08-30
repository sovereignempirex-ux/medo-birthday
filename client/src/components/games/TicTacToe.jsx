import { useState, useEffect } from 'react'

function TicTacToe({ onClose, socket, currentUser }) {
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [currentTurn, setCurrentTurn] = useState('X')
  const [status, setStatus] = useState('waiting')
  const [winner, setWinner] = useState(null)
  const [players, setPlayers] = useState([])
  const [mySymbol, setMySymbol] = useState('')
  const [rooms, setRooms] = useState([])
  const [showRooms, setShowRooms] = useState(false)

  useEffect(() => {
    if (!socket) return

    socket.on('tictactoe_state', (room) => {
      setBoard(room.board)
      setCurrentTurn(room.currentTurn)
      setStatus(room.status)
      setWinner(room.winner)
      setPlayers(room.players)
      if (room.players.find(p => p.socketId === socket.id)) {
        setMySymbol(room.players.find(p => p.socketId === socket.id)?.symbol || '')
      }
      if (room.status === 'playing' || room.status === 'finished') {
        setJoined(true)
      }
    })

    socket.on('room_full', () => {
      alert('الغرفة ممتلئة!')
    })

    return () => {
      socket.off('tictactoe_state')
      socket.off('room_full')
    }
  }, [socket])

  const createRoom = () => {
    const id = 'room_' + Math.random().toString(36).substr(2, 6)
    setRoomId(id)
    socket?.emit('join_tictactoe', { roomId: id, playerName: currentUser?.name || 'لاعب' })
  }

  const joinRoom = (id) => {
    setRoomId(id)
    socket?.emit('join_tictactoe', { roomId: id, playerName: currentUser?.name || 'لاعب' })
  }

  const handleCellClick = (index) => {
    if (!socket || status !== 'playing' || board[index] || currentTurn !== mySymbol) return
    socket.emit('tictactoe_move', { roomId, index, symbol: mySymbol })
  }

  const resetGame = () => {
    socket?.emit('tictactoe_reset', { roomId })
  }

  const checkWinner = () => {
    if (winner === 'draw') return '🤝 تعادل!'
    if (winner) return `🎉 ${winner} فاز!`
    if (status === 'waiting') return '⏳ في انتظار لاعب آخر...'
    return `دور: ${currentTurn}`
  }

  if (!joined) {
    return (
      <div className="game-modal" onClick={onClose}>
        <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
          <button className="game-close" onClick={onClose}>✕</button>
          <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>⭕ XO لاعبين</h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>العب XO مع صديقك أونلاين!</p>

          <button className="start-game-btn" onClick={createRoom}>🏠 إنشاء غرفة جديدة</button>

          <div style={{ textAlign: 'center', margin: '16px 0', color: 'rgba(255,255,255,0.5)' }}>أو</div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input className="input-glass" placeholder="أدخل رقم الغرفة" value={roomId} onChange={(e) => setRoomId(e.target.value)} dir="ltr" />
            <button className="search-btn" onClick={() => joinRoom(roomId)} style={{ padding: '12px 24px' }}>انضمام</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-modal" onClick={onClose}>
      <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="game-close" onClick={onClose}>✕</button>
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>⭕ XO</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
          الغرفة: <span style={{ color: '#FFD700', fontFamily: 'monospace' }}>{roomId}</span>
        </p>

        <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '18px', color: '#fff' }}>
          {checkWinner()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          {players.map((p, i) => (
            <div key={i} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: p.symbol === mySymbol ? '1px solid #FFD700' : '1px solid transparent' }}>
              {p.name} ({p.symbol}) {p.symbol === mySymbol && '👈 أنت'}
            </div>
          ))}
        </div>

        <div className="ttt-board">
          {board.map((cell, i) => {
            const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
            const isWin = winner && winner !== 'draw' && wins.some(w => w.includes(i) && w.every(j => board[j] === winner))
            return (
              <div key={i} className={`ttt-cell ${isWin ? 'winner' : ''}`} onClick={() => handleCellClick(i)}>
                {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
              </div>
            )
          })}
        </div>

        {status === 'finished' && (
          <button className="start-game-btn" onClick={resetGame} style={{ marginTop: '20px' }}>🔄 لعب مرة أخرى</button>
        )}
      </div>
    </div>
  )
}

export default TicTacToe
