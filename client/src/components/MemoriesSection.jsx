import { useState } from 'react'

function MemoriesSection() {
  const [lightbox, setLightbox] = useState(null)
  const memories = [
    { id: '1', emoji: '🎂', caption: 'عيد الميلاد الماضي - أجمل لحظة!' },
    { id: '2', emoji: '🎉', caption: 'الاحتفال مع الأصدقاء في الصيف' },
    { id: '3', emoji: '📸', caption: 'صورة جماعية لا تُنسى' },
    { id: '4', emoji: '🎈', caption: 'مفاجأة عيد الميلاد' },
    { id: '5', emoji: '🎁', caption: 'فتح الهدايا - لحظات الفرح' },
    { id: '6', emoji: '🎵', caption: 'الرقص والاحتفال حتى الصباح' },
  ]

  return (
    <section className="content-section">
      <h2 className="section-title">🖼️ ذكريات مع ميدو</h2>
      <p className="section-subtitle">لحظات لا تُنسى من ذكرياتنا الجميلة</p>

      <div className="memories-grid">
        {memories.map(memory => (
          <div key={memory.id} className="memory-card glass-card" onClick={() => setLightbox(memory)}>
            <div className="memory-img">{memory.emoji}</div>
            <div className="memory-caption">{memory.caption}</div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-content glass-strong" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '120px', marginBottom: '20px' }}>{lightbox.emoji}</div>
            <h3 style={{ fontSize: '24px', color: '#FFD700' }}>{lightbox.caption}</h3>
          </div>
        </div>
      )}
    </section>
  )
}

export default MemoriesSection
