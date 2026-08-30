import { useEffect, useRef } from 'react'

function Fireworks({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let particles = []
    let animationId

    class FireworkParticle {
      constructor(x, y, color) {
        this.x = x; this.y = y
        this.vx = (Math.random() - 0.5) * 12
        this.vy = (Math.random() - 0.5) * 12
        this.life = 1
        this.decay = Math.random() * 0.02 + 0.01
        this.color = color
        this.size = Math.random() * 4 + 2
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        this.vy += 0.2
        this.life -= this.decay
        this.size *= 0.98
      }
      draw() {
        ctx.globalAlpha = this.life
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    const createFirework = () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height * 0.5
      const colors = ['#FFD700', '#FF69B4', '#8B5CF6', '#3B82F6', '#00F2FE', '#FF6347']
      const color = colors[Math.floor(Math.random() * colors.length)]
      for (let i = 0; i < 30; i++) particles.push(new FireworkParticle(x, y, color))
    }

    let frame = 0
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (frame % 15 === 0) createFirework()
      particles = particles.filter(p => p.life > 0)
      particles.forEach(p => { p.update(); p.draw() })
      frame++
      animationId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationId)
  }, [active])

  return active ? <canvas id="fireworks-canvas" ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} /> : null
}

export default Fireworks
