import { useState, useEffect } from 'react'

function VideoSearchSection() {
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)

  const mockVideos = [
    { id: '1', title: 'أغاني عيد ميلاد سعيد - احتفال رائع', channel: 'Music Party', emoji: '🎵' },
    { id: '2', title: 'أفضل لحظات الاحتفالات مع الأصدقاء', channel: 'Fun Times', emoji: '🎉' },
    { id: '3', title: 'تورتة عيد ميلاد مذهلة - تصميمات فاخرة', channel: 'Cake Masters', emoji: '🎂' },
    { id: '4', title: 'ألعاب حفلات عيد الميلاد الممتعة', channel: 'Game Hub', emoji: '🎮' },
    { id: '5', title: 'أجمل الذكريات مع الأصدقاء', channel: 'Memories TV', emoji: '📸' },
    { id: '6', title: 'موسيقى احتفالية هادئة', channel: 'Chill Vibes', emoji: '🎶' },
  ]

  const searchVideos = () => {
    setLoading(true)
    setTimeout(() => {
      const filtered = mockVideos.filter(v => 
        v.title.includes(query) || v.channel.includes(query) || query === ''
      )
      setVideos(filtered.length > 0 ? filtered : mockVideos)
      setLoading(false)
    }, 800)
  }

  useEffect(() => { searchVideos() }, [])

  return (
    <section className="content-section">
      <h2 className="section-title">🔎 بحث الفيديوهات</h2>
      <p className="section-subtitle">ابحث عن فيديوهات الاحتفال المفضلة</p>

      <div className="search-bar">
        <input type="text" className="search-input" placeholder="ابحث عن فيديو..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchVideos()} />
        <button className="search-btn" onClick={searchVideos} disabled={loading}>{loading ? '⏳' : '🔍 بحث'}</button>
      </div>

      <div className="video-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card glass-card">
            <div className="video-thumb">{video.emoji}</div>
            <div className="video-info">
              <div className="video-title">{video.title}</div>
              <div className="video-channel">{video.channel}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default VideoSearchSection
