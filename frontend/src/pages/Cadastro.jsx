import { useState } from 'react'
import { api } from '../services/api'

const copyrightYear = new Date().getFullYear()

export default function Cadastro() {
  const [accountType, setAccountType] = useState('PJ')
  const [document, setDocument] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')
    setIsSuccess(false)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      document: formData.get('document'),
      type: formData.get('type'),
      password: formData.get('password'),
    }

    try {
      await api.post('/users', payload)
      setIsSuccess(true)
      setNotice('Conta criada com sucesso. Agora você já pode entrar.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAccountTypeChange = (event) => {
    const nextType = event.target.value
    const maxLength = nextType === 'PJ' ? 14 : 11
    setAccountType(nextType)
    setDocument((value) => value.slice(0, maxLength))
  }

  return (
    <main className="login-page registration-page">
      <section aria-label="Cadastro de usuário Lerapay" className="login-panel registration-panel">
        <div className="login-panel__content registration-panel__content">
          <a aria-label="Lerapay — início" className="login-brand" href="/">
            <img alt="Lerapay" src="/logo.png" />
          </a>

          <div className="login-heading registration-heading">
            <p className="login-eyebrow">COMECE A USAR A LERAPAY</p>
            <h1>Crie sua conta</h1>
            <p>Preencha os dados para cadastrar sua empresa.</p>
          </div>

          <form className="login-form registration-form" onSubmit={handleSubmit}>
            <label className="login-field registration-field registration-field--wide">
              <span>Nome da empresa</span>
              <input
                autoComplete="organization"
                name="name"
                placeholder="Empresa Exemplo LTDA"
                required
                type="text"
              />
            </label>

            <label className="login-field registration-field">
              <span>E-mail</span>
              <input
                autoComplete="email"
                name="email"
                placeholder="contato@exemplo.com.br"
                required
                type="email"
              />
            </label>

            <label className="login-field registration-field">
              <span>Telefone</span>
              <input
                autoComplete="tel"
                inputMode="tel"
                name="phone"
                placeholder="+5511999999999"
                required
                type="tel"
              />
            </label>

            <label className="login-field registration-field">
              <span>{accountType === 'PJ' ? 'CNPJ' : 'CPF'}</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                maxLength={accountType === 'PJ' ? 14 : 11}
                name="document"
                onChange={(event) => {
                  const maxLength = accountType === 'PJ' ? 14 : 11
                  setDocument(event.target.value.replace(/\D/g, '').slice(0, maxLength))
                }}
                placeholder={accountType === 'PJ' ? '12345678000199' : '12345678901'}
                required
                type="text"
                value={document}
              />
            </label>

            <label className="login-field registration-field">
              <span>Tipo de conta</span>
              <select
                name="type"
                onChange={handleAccountTypeChange}
                value={accountType}
              >
                <option value="PJ">Pessoa jurídica (PJ)</option>
                <option value="PF">Pessoa física (PF)</option>
              </select>
            </label>

            <label className="login-field registration-field registration-field--wide">
              <span>Senha</span>
              <span className="login-password">
                <input
                  autoComplete="new-password"
                  minLength={8}
                  name="password"
                  placeholder="Mínimo de 8 caracteres"
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

            {notice && (
              <p
                aria-live="polite"
                className={`login-notice registration-notice${isSuccess ? ' registration-notice--success' : ''}`}
                role={isSuccess ? 'status' : 'alert'}
              >
                {notice}
              </p>
            )}

            <button className="login-submit registration-submit" disabled={isSubmitting || isSuccess} type="submit">
              {isSubmitting ? 'Enviando...' : isSuccess ? 'Conta criada' : 'Criar conta'}
              {!isSubmitting && !isSuccess && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-signup registration-login-link">
            {isSuccess ? <>Acesse sua conta: <a href="/login">Entrar</a></> : <>Já tem uma conta? <a href="/login">Entrar</a></>}
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
          <h2>Uma conta para<br />crescer junto.</h2>
          <p className="login-showcase__description">
            Cadastre seus dados e tenha sua operação financeira em um só lugar.
          </p>
          <div className="registration-benefits">
            <div><span aria-hidden="true">✓</span><p><strong>Visão clara</strong><small>Acompanhe suas movimentações em tempo real.</small></p></div>
            <div><span aria-hidden="true">✓</span><p><strong>Mais controle</strong><small>Gerencie sua operação com simplicidade.</small></p></div>
            <div><span aria-hidden="true">✓</span><p><strong>Seus dados protegidos</strong><small>Informações tratadas com segurança.</small></p></div>
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
