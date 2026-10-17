const navigation = [
  {
    label: 'Visão geral',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { id: 'transactions', label: 'Transações', icon: 'arrows' },
    ],
  },
  {
    label: 'Gestão financeira',
    items: [
      { id: 'withdrawals', label: 'Saques', icon: 'wallet' },
      { id: 'checkout', label: 'Checkout', icon: 'card' },
      { id: 'fees', label: 'Taxas', icon: 'percent' },
    ],
  },
]

function NavigationIcon({ name }) {
  const paths = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    arrows: (
      <>
        <path d="M7 7h13m0 0-3-3m3 3-3 3" />
        <path d="M17 17H4m0 0 3 3m-3-3 3-3" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2.5" />
        <path d="M3 9h18m-5 5h.01M7 5V3.5h10V5" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 10h18m-14 5h4" />
      </>
    ),
    percent: <path d="M19 5 5 19m15-1a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />,
  }

  return (
    <svg
      aria-hidden="true"
      className="sidebar__icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

export default function Sidebar({ activeItem, onNavigate, isOpen, onClose, user }) {
  const initials = (user?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <button
        aria-label="Fechar menu"
        className={`sidebar-backdrop${isOpen ? ' sidebar-backdrop--visible' : ''}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <a
          className="brand"
          href="#dashboard"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('dashboard')
          }}
        >
          <img alt="Lerapay" className="brand__logo" src="/logo.png" />
        </a>

        <div className="workspace">
          <span className="workspace__avatar" aria-hidden="true">B</span>
          <span className="workspace__copy">
            <strong>Minha empresa</strong>
            <span>Conta principal</span>
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="workspace__chevron">
            <path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>

        <nav aria-label="Menu principal" className="sidebar__navigation">
          {navigation.map((section) => (
            <div className="sidebar__section" key={section.label}>
              <p className="sidebar__section-title">{section.label}</p>
              {section.items.map((item) => (
                <button
                  aria-current={activeItem === item.id ? 'page' : undefined}
                  className={`sidebar__link${activeItem === item.id ? ' sidebar__link--active' : ''}`}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  type="button"
                >
                  <NavigationIcon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__bottom">
          
          <button className="sidebar__profile" type="button">
            <span className="profile-avatar" aria-hidden="true">{initials}</span>
            <span className="sidebar__profile-copy">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </span>
            <span aria-hidden="true" className="sidebar__profile-more">•••</span>
          </button>
        </div>
      </aside>
    </>
  )
}
