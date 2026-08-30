import { useState, useEffect, useRef } from 'react'

function ChatSection({ currentUser, socket, apiUrl }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // Load messages from server
    fetch(`${apiUrl}/api/chat/messages`)
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(() => setMessages([{ id: '1', sender: 'النظام', text: '✨ مرحباً بكم في احتفال عيد ميلاد ميدو! اكتبوا أمنياتكم 🎂', time: new Date().toLocaleTimeString('ar-EG'), type: 'received' }]))

    if (!socket) return

    socket.emit('join_chat', { name: currentUser.name || currentUser.email })

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('typing', (data) => {
      if (data.sender !== currentUser.name) setTyping(true)
    })

    socket.on('stop_typing', () => {
      setTyping(false)
    })

    socket.on('active_users', (users) => {
      setOnlineUsers(users.length)
    })

    return () => {
      socket.off('new_message')
      socket.off('typing')
      socket.off('stop_typing')
      socket.off('active_users')
    }
  }, [socket, currentUser, apiUrl])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const msgData = { sender: currentUser.name || currentUser.email, text: input, room: 'general' }

    if (socket) {
      socket.emit('send_message', msgData)
    }

    // Fallback: add locally
    setMessages(prev => [...prev, { ...msgData, id: Date.now().toString(), createdAt: new Date() }])
    setInput('')
    setTyping(false)

    if (socket) socket.emit('stop_typing', msgData)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (socket) {
      socket.emit('typing', { sender: currentUser.name })
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { sender: currentUser.name })
      }, 2000)
    }
  }

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="content-section">
      <h2 className="section-title">💬 الدردشة المباشرة</h2>
      <p className="section-subtitle">
        تحدثوا مع الأصدقاء في الاحتفال
        {onlineUsers > 0 && <span style={{ marginRight: '8px' }}><span className="online-dot"></span>{onlineUsers} متصل</span>}
      </p>
      <div className="chat-container glass-card">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`chat-message ${msg.sender === (currentUser.name || currentUser.email) ? 'sent' : 'received'}`}>
              <div className="chat-sender">{msg.sender}</div>
              <div>{msg.text}</div>
              <div className="chat-time">{formatTime(msg.createdAt || msg.time)}</div>
            </div>
          ))}
          {typing && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="اكتب رسالتك هنا..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="chat-send-btn" onClick={sendMessage}>📨</button>
        </div>
      </div>
    </section>
  )
}

export default ChatSection
