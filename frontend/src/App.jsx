import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Transacoes from './pages/Transacoes'
import Dashboard from './pages/Dashboard'
import CheckoutForm from './pages/CheckoutForm'
import Saques from './pages/Saques'
import { api } from './services/api'
import { clearAuthSession, getAuthSession, saveAuthSession } from './services/auth'
import './App.css'

function App() {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [authSession, setAuthSession] = useState(getAuthSession)
  const [authNotice, setAuthNotice] = useState('')

  useEffect(() => {
    const syncPage = () => setCurrentPath(window.location.pathname)
    const syncStorage = () => setAuthSession(getAuthSession())
    const endExpiredSession = () => {
      clearAuthSession()
      setAuthSession(null)
      setAuthNotice('Sua sessão expirou. Entre novamente para continuar.')
      window.history.replaceState({}, '', '/login')
      setCurrentPath('/login')
    }
    window.addEventListener('popstate', syncPage)
    window.addEventListener('storage', syncStorage)
    window.addEventListener('lerapay:session-expired', endExpiredSession)
    return () => {
      window.removeEventListener('popstate', syncPage)
      window.removeEventListener('storage', syncStorage)
      window.removeEventListener('lerapay:session-expired', endExpiredSession)
    }
  }, [])

  useEffect(() => {
    if (!authSession && currentPath !== '/login' && currentPath !== '/cadastro') {
      window.history.replaceState({}, '', '/login')
    } else if (authSession && currentPath === '/login') {
      window.history.replaceState({}, '', '/')
    }
  }, [authSession, currentPath])

  const handleLogin = (session, rememberMe) => {
    saveAuthSession(session, rememberMe)
    setAuthSession(session)
    setAuthNotice('')
    window.history.pushState({}, '', '/')
    setCurrentPath('/')
  }

  const handleLogout = async () => {
    const token = authSession?.accessToken
    try {
      if (token) await api.post('/auth/logout', {}, { token })
      setAuthNotice('')
    } catch {
      setAuthNotice('Sua sessão foi encerrada neste dispositivo, mas o servidor não confirmou o logout.')
    } finally {
      clearAuthSession()
      setAuthSession(null)
      setIsMenuOpen(false)
      window.history.pushState({}, '', '/login')
      setCurrentPath('/login')
    }
  }

  if (currentPath === '/login' && !authSession) {
    return <Login onLogin={handleLogin} initialNotice={authNotice} />
  }
  if (currentPath === '/cadastro' && !authSession) return <Cadastro />
  if (!authSession) return <Login onLogin={handleLogin} initialNotice={authNotice} />

  const navigate = (item) => {
    setActiveItem(item)
    setIsMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeItem={activeItem}
        isOpen={isMenuOpen}
        user={authSession.merchant}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={navigate}
      />
      <div className="app-main">
        <Navbar
          activeItem={activeItem}
          user={authSession.merchant}
          onLogout={handleLogout}
          onMenuClick={() => setIsMenuOpen(true)}
        />
        <main className="page-content">
          {activeItem === 'dashboard' && <Dashboard onNavigate={navigate} user={authSession.merchant} />}
          {activeItem === 'transactions' && <Transacoes />}
          {activeItem === 'checkout' && <CheckoutForm />}
          {activeItem === 'withdrawals' && <Saques />}
        </main>
      </div>
    </div>
  )
}

export default App
