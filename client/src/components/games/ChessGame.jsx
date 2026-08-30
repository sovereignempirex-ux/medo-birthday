import { useState, useEffect } from 'react'

function ChessGame({ onClose, socket, currentUser }) {
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)
  const [board, setBoard] = useState([])
  const [currentTurn, setCurrentTurn] = useState('white')
  const [status, setStatus] = useState('waiting')
  const [players, setPlayers] = useState([])
  const [myColor, setMyColor] = useState('')
  const [selectedCell, setSelectedCell] = useState(null)
  const [validMoves, setValidMoves] = useState([])

  useEffect(() => {
    if (!socket) return

    socket.on('chess_state', (room) => {
      setBoard(room.board)
      setCurrentTurn(room.currentTurn)
      setStatus(room.status)
      setPlayers(room.players)
      if (room.players.find(p => p.socketId === socket.id)) {
        setMyColor(room.players.find(p => p.socketId === socket.id)?.symbol || '')
      }
      if (room.status === 'playing' || room.status === 'finished') {
        setJoined(true)
      }
    })

    socket.on('room_full', () => {
      alert('الغرفة ممتلئة!')
    })

    return () => {
      socket.off('chess_state')
      socket.off('room_full')
    }
  }, [socket])

  const createRoom = () => {
    const id = 'chess_' + Math.random().toString(36).substr(2, 6)
    setRoomId(id)
    socket?.emit('join_chess', { roomId: id, playerName: currentUser?.name || 'لاعب' })
  }

  const joinRoom = (id) => {
    setRoomId(id)
    socket?.emit('join_chess', { roomId: id, playerName: currentUser?.name || 'لاعب' })
  }

  const handleCellClick = (row, col) => {
    if (!socket || status !== 'playing' || currentTurn !== myColor) return

    if (!selectedCell) {
      const piece = board[row][col]
      if (!piece) return
      // Check if piece belongs to current player
      const isWhitePiece = ['♙','♖','♘','♗','♕','♔'].includes(piece)
      const isBlackPiece = ['♟','♜','♞','♝','♛','♚'].includes(piece)
      if ((myColor === 'white' && !isWhitePiece) || (myColor === 'black' && !isBlackPiece)) return

      setSelectedCell({ row, col })
      // Simple valid moves (adjacent cells for demo)
      const moves = []
      for (let r = Math.max(0, row - 1); r <= Math.min(7, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
          if (r !== row || c !== col) moves.push({ row: r, col: c })
        }
      }
      setValidMoves(moves)
    } else {
      const isValid = validMoves.some(m => m.row === row && m.col === col)
      if (isValid) {
        socket.emit('chess_move', { roomId, from: selectedCell, to: { row, col } })
      }
      setSelectedCell(null)
      setValidMoves([])
    }
  }

  if (!joined) {
    return (
      <div className="game-modal" onClick={onClose}>
        <div className="game-modal-content glass-strong" onClick={e => e.stopPropagation()}>
          <button className="game-close" onClick={onClose}>✕</button>
          <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>♟️ شطرنج</h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>العب شطرنج مع صديقك أونلاين!</p>

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
        <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#FFD700', marginBottom: '8px' }}>♟️ شطرنج</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
          الغرفة: <span style={{ color: '#FFD700', fontFamily: 'monospace' }}>{roomId}</span>
        </p>

        <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '18px', color: '#fff' }}>
          {status === 'waiting' ? '⏳ في انتظار لاعب آخر...' : `دور: ${currentTurn === 'white' ? '⚪ الأبيض' : '⚫ الأسود'}`}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          {players.map((p, i) => (
            <div key={i} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: p.symbol === myColor ? '1px solid #FFD700' : '1px solid transparent' }}>
              {p.name} ({p.symbol === 'white' ? '⚪' : '⚫'}) {p.symbol === myColor && '👈 أنت'}
            </div>
          ))}
        </div>

        <div className="chess-board">
          {board.map((row, r) => (
            row.map((cell, c) => {
              const isLight = (r + c) % 2 === 0
              const isSelected = selectedCell?.row === r && selectedCell?.col === c
              const isValid = validMoves.some(m => m.row === r && m.col === c)
              return (
                <div key={`${r}-${c}`}
                  className={`chess-cell ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isValid ? 'valid-move' : ''}`}
                  onClick={() => handleCellClick(r, c)}>
                  {cell || ''}
                </div>
              )
            })
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          اضغط على قطعة لتحديدها، ثم اضغط على الخلية المقصودة
        </p>
      </div>
    </div>
  )
}

export default ChessGame
