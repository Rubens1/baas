import { useState } from 'react'

const pageTitles = {
  dashboard: 'Dashboard',
  transactions: 'Transações',
  withdrawals: 'Saques',
  checkout: 'Checkout',
}

function Icon({ name }) {
  const paths = {
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="topbar__icon"
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

export default function Navbar({ activeItem, onMenuClick, onLogout, user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = (user?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <header className="topbar">
      <div className="topbar__leading">
        <button
          aria-label="Abrir menu de navegação"
          className="icon-button topbar__menu-button"
          onClick={onMenuClick}
          type="button"
        >
          <Icon name="menu" />
        </button>
        <div className="breadcrumbs">
          <span>Painel</span>
          <span aria-hidden="true" className="breadcrumbs__separator">/</span>
          <strong>{pageTitles[activeItem]}</strong>
        </div>
      </div>

      <div className="topbar__actions">
       
        <span aria-hidden="true" className="topbar__divider" />
       
        <button
          aria-expanded={menuOpen}
          aria-label={`Abrir perfil de ${user?.name ?? 'usuário'}`}
          className="topbar__user"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span className="profile-avatar profile-avatar--small" aria-hidden="true">{initials}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="topbar__chevron">
            <path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        {menuOpen && (
          <div className="profile-menu" role="menu">
            <div className="profile-menu__identity">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button
              className="profile-menu__logout"
              onClick={() => {
                setMenuOpen(false)
                onLogout()
              }}
              role="menuitem"
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l5-5-5-5m5 5H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
