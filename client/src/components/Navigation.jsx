function Navigation({ activeSection, onNavigate }) {
  const sections = [
    { id: 'hero', label: '🎉 الرئيسية' },
    { id: 'cake', label: '🎂 الكعكة' },
    { id: 'chat', label: '💬 الشات' },
    { id: 'games', label: '🎮 الألعاب' },
    { id: 'videos', label: '🔎 الفيديوهات' },
    { id: 'memories', label: '🖼️ الذكريات' },
  ]

  return (
    <nav className="nav-glass glass">
      {sections.map(s => (
        <button key={s.id} className={`nav-btn ${activeSection === s.id ? 'active' : ''}`} onClick={() => onNavigate(s.id)}>
          {s.label}
        </button>
      ))}
    </nav>
  )
}

export default Navigation
