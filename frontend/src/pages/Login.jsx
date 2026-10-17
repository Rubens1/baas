import { useState } from 'react'
import { api } from '../services/api'

const copyrightYear = new Date().getFullYear()

function Brand() {
  return (
    <a aria-label="Lerapay — início" className="login-brand" href="/">
      <img alt="Lerapay" src="/logo.png" />
    </a>
  )
}

export default function Login({ onLogin, initialNotice = '' }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState(initialNotice)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      const response = await api.login({
        email: formData.get('email').trim(),
        password: formData.get('password'),
      })
      if (!response.data?.accessToken || !response.data?.merchant || !response.data?.expiresAt) {
        throw new Error('O servidor retornou uma sessão inválida.')
      }
      onLogin(response.data, formData.get('remember') === 'on')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section aria-label="Acesso à conta Lerapay" className="login-panel">
        <div className="login-panel__content">
          <Brand />

          <div className="login-heading">
            <p className="login-eyebrow">BEM-VINDO DE VOLTA</p>
            <h1>Acesse sua conta</h1>
            <p>Entre para acompanhar sua operação financeira.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>E-mail</span>
              <input
                autoComplete="email"
                name="email"
                placeholder="voce@empresa.com"
                required
                type="email"
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <span className="login-password">
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="Digite sua senha"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="login-password__toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </span>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input name="remember" type="checkbox" />
                <span>Manter conectado</span>
              </label>
              <button
                className="login-link"
                onClick={() => setNotice('A recuperação de senha ainda não está disponível.')}
                type="button"
              >
                Esqueceu a senha?
              </button>
            </div>

            {notice && <p aria-live="polite" className="login-notice" role="alert">{notice}</p>}

            <button className="login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-signup">
            Ainda não tem uma conta? <a href="/cadastro">Cadastre-se</a>
          </p>
        </div>

        <footer className="login-footer">
          <span>© {copyrightYear} Lerapay</span>
          <span>Pagamentos simples. Gestão inteligente.</span>
        </footer>
      </section>

      <aside className="login-showcase">
        <div aria-hidden="true" className="login-showcase__glow" />
        <div className="login-showcase__top">
          <span className="login-showcase__badge"><span /> Plataforma financeira</span>
        </div>
        <div className="login-showcase__body">
          <p className="login-showcase__eyebrow">SUA EMPRESA, EM MOVIMENTO</p>
          <h2>Tenha o controle.<br />Vá mais longe.</h2>
          <p className="login-showcase__description">
            Uma visão clara do seu dinheiro para você focar no que realmente importa: crescer.
          </p>

          <div className="login-preview">
            <div className="login-preview__header">
              <div>
                <span>Saldo disponível · prévia ilustrativa</span>
                <strong>R$ 24.850,00</strong>
              </div>
              <span className="login-preview__wallet" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="15" rx="2.5" />
                  <path d="M3 9h18m-5 5h.01M7 5V3.5h10V5" />
                </svg>
              </span>
            </div>
            <div className="login-chart" aria-hidden="true">
              <div className="login-chart__labels"><span>R$ 30k</span><span>R$ 20k</span><span>R$ 10k</span></div>
              <svg viewBox="0 0 410 115" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9e98ff" stopOpacity=".3" />
                    <stop offset="100%" stopColor="#9e98ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 91 C28 86 35 64 64 71 S102 86 128 58 S165 69 190 48 S229 59 256 38 S294 54 321 28 S365 43 410 8 V115 H0Z" fill="url(#chart-fill)" />
                <path d="M0 91 C28 86 35 64 64 71 S102 86 128 58 S165 69 190 48 S229 59 256 38 S294 54 321 28 S365 43 410 8" fill="none" stroke="#aaa5ff" strokeWidth="2.5" />
                <circle cx="321" cy="28" r="4" fill="#fff" stroke="#aaa5ff" strokeWidth="2" />
              </svg>
              <div className="login-chart__months"><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span></div>
            </div>
            <div className="login-preview__activity">
              <span className="login-preview__activity-icon" aria-hidden="true">↙</span>
              <span><strong>Pagamento recebido</strong><small>Hoje, às 14:32</small></span>
              <strong className="login-preview__amount">+ R$ 1.250,00</strong>
            </div>
          </div>
        </div>
        <div className="login-showcase__bottom">
          <div className="login-dots" aria-hidden="true"><span /><span /><span /></div>
          <p>Seu financeiro mais simples, seguro e conectado.</p>
        </div>
      </aside>
    </main>
  )
}