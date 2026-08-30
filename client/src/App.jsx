import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import LoginScreen from './components/LoginScreen'
import LoadingScreen from './components/LoadingScreen'
import HeroSection from './components/HeroSection'
import CakeSection from './components/CakeSection'
import ChatSection from './components/ChatSection'
import GamesSection from './components/GamesSection'
import VideoSearchSection from './components/VideoSearchSection'
import MemoriesSection from './components/MemoriesSection'
import MusicControl from './components/MusicControl'
import Navigation from './components/Navigation'
import ParticlesBackground from './components/ParticlesBackground'

const API_URL = import.meta.env.VITE_API_URL || ''
const SOCKET_URL = window.location.origin

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMain, setShowMain] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [cakeComplete, setCakeComplete] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('medo_auth_token')
    const savedUser = localStorage.getItem('medo_user')
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(atob(token))
        if (parsed.exp > Date.now()) {
          setUser(JSON.parse(savedUser))
          setLoading(true)
          const s = io(SOCKET_URL)
          setSocket(s)
        } else {
          localStorage.removeItem('medo_auth_token')
          localStorage.removeItem('medo_user')
        }
      } catch (e) {
        localStorage.removeItem('medo_auth_token')
        localStorage.removeItem('medo_user')
      }
    }
    return () => { if (socket) socket.disconnect() }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('medo_auth_token', token)
    localStorage.setItem('medo_user', JSON.stringify(userData))
    const s = io(SOCKET_URL)
    setSocket(s)
    setLoading(true)
  }

  const handleLoadingComplete = () => {
    setLoading(false)
    setShowMain(true)
  }

  const handleCakeComplete = () => {
    setCakeComplete(true)
    setActiveSection('chat')
  }

  const scrollToSection = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  if (!user) return <LoginScreen onLogin={handleLogin} apiUrl={API_URL} />
  if (loading) return <LoadingScreen onComplete={handleLoadingComplete} />

  return (
    <div className="animate-fade-in">
      <div className="bg-ani"></div>
      <ParticlesBackground />

      {showMain && (
        <>
          <Navigation activeSection={activeSection} onNavigate={scrollToSection} />

          <div id="hero"><HeroSection /></div>

          <div id="cake">
            {!cakeComplete ? (
              <CakeSection onComplete={handleCakeComplete} />
            ) : (
              <section className="content-section" style={{ textAlign: 'center' }}>
                <h2 className="section-title shimmer-text">🎉 HAPPY BIRTHDAY MEDO! 🎂</h2>
                <p className="birthday-wish" style={{ margin: '0 auto' }}>
                  كل سنة وأنت طيب يا ميدو ❤️<br/>
                  أتمنى تكون السنة الجديدة مليئة بالمغامرات والنجاحات واللحظات الجميلة.
                </p>
              </section>
            )}
          </div>

          <div id="chat"><ChatSection currentUser={user} socket={socket} apiUrl={API_URL} /></div>
          <div id="games"><GamesSection currentUser={user} socket={socket} apiUrl={API_URL} /></div>
          <div id="videos"><VideoSearchSection /></div>
          <div id="memories"><MemoriesSection /></div>

          <MusicControl />

          <footer style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            <p>🎂 صُنع بحب لعيد ميلاد ميدو | 2026</p>
            <p style={{ marginTop: '8px' }}>✨ كل سنة وأنت طيب يا أروع صديق!</p>
          </footer>
        </>
      )}
    </div>
  )
}

export default App
