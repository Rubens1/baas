import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../services/api'

const formatAmount = (amount) =>
  Number(amount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const formatDate = (value) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))

const methods = {
  PIX: 'Pix',
  CARD: 'Cartão',
}

const statuses = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  DENIED: 'Recusado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
}

export default function Checkout() {
  const [method, setMethod] = useState('PIX')
  const [brand, setBrand] = useState('ALL')
  const [amount, setAmount] = useState('')
  const [installments, setInstallments] = useState('1')
  const [fees, setFees] = useState([])
  const [feesLoading, setFeesLoading] = useState(true)
  const [feesError, setFeesError] = useState('')
  const [checkouts, setCheckouts] = useState([])
  const [checkoutsLoading, setCheckoutsLoading] = useState(true)
  const [checkoutsError, setCheckoutsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdCheckout, setCreatedCheckout] = useState(null)

  useEffect(() => {
    let isCurrent = true

    const loadFees = async () => {
      setFeesLoading(true)
      setFeesError('')
      try {
        const response = await api.get('/fees', {
          params: { method, ...(method === 'CARD' ? { brand } : {}) },
        })
        if (!isCurrent) return
        setFees(response.data)
        const firstInstallment = response.data[0]?.installments
        if (firstInstallment) setInstallments(String(firstInstallment))
      } catch (error) {
        console.error('Erro ao carregar taxas de checkout:', error)
        if (isCurrent) setFeesError(error.message || 'Não foi possível carregar as taxas.')
      } finally {
        if (isCurrent) setFeesLoading(false)
      }
    }

    loadFees()
    return () => {
      isCurrent = false
    }
  }, [method, brand])

  useEffect(() => {
    let isCurrent = true

    const loadCheckouts = async () => {
      try {
        const response = await api.get('/checkouts')
        if (isCurrent) setCheckouts(response.data)
            console.log('Checkouts carregados:', response.data)
      } catch (error) {
        console.error('Erro ao carregar checkouts:', error)
        if (isCurrent) setCheckoutsError(error.message || 'Não foi possível carregar os checkouts.')
      } finally {
        if (isCurrent) setCheckoutsLoading(false)
      }
    }

    loadCheckouts()
    return () => {
      isCurrent = false
    }
  }, [])

  const selectedFee = useMemo(
    () =>
      fees.find((fee) => fee.installments === Number(installments) && fee.brand === brand) ??
      fees.find((fee) => fee.installments === Number(installments) && fee.brand === 'ALL'),
    [fees, installments, brand],
  )
  const availableInstallments = [...new Set(fees.map((fee) => fee.installments))]
  const numericAmount = Number(amount)
  const feeAmount = selectedFee && numericAmount > 0
    ? Math.round(numericAmount * selectedFee.feePercent) / 100
    : null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setCreatedCheckout(null)

    try {
      const response = await api.post('/checkouts', {
        method,
        amount: numericAmount,
        ...(method === 'CARD' ? { installments: Number(installments), brand } : {}),
      })
      setCreatedCheckout(response.data)
      setCheckouts((current) => [response.data, ...current])
      setAmount('')
    } catch (error) {
      console.error('Erro ao criar checkout:', error)
      setSubmitError(error.message || 'Não foi possível criar o checkout.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="checkout-page">
      <header className="checkout-page__header">
        <p className="eyebrow">Vendas</p>
        <h1>Checkout</h1>
        <p>Crie uma cobrança e acompanhe os checkouts registrados na sua conta.</p>
      </header>

      <div className="checkout-layout">
        <form className="content-card checkout-form" onSubmit={handleSubmit}>
          <div className="content-card__header">
            <div>
              <h2>Criar checkout</h2>
              <p>As taxas e condições são carregadas da sua conta.</p>
            </div>
          </div>

          <div className="checkout-form__fields">
            <label className="checkout-field">
              <span>Método de pagamento</span>
              <select
                value={method}
                onChange={(event) => {
                  setMethod(event.target.value)
                  setBrand('ALL')
                  setInstallments('1')
                  setCreatedCheckout(null)
                }}
              >
                <option value="PIX">Pix</option>
                <option value="CARD">Cartão</option>
              </select>
            </label>

            <label className="checkout-field">
              <span>Valor da cobrança</span>
              <span className="checkout-field__amount">
                <span>R$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </span>
            </label>

            {method === 'CARD' && (
              <>
              <label className="checkout-field">
                <span>Bandeira (opcional)</span>
                <input
                  maxLength="32"
                  onChange={(event) => setBrand(event.target.value.trim().toUpperCase() || 'ALL')}
                  placeholder="ALL para todas"
                  value={brand === 'ALL' ? '' : brand}
                />
              </label>
              <label className="checkout-field">
                <span>Parcelas</span>
                <select
                  value={installments}
                  onChange={(event) => setInstallments(event.target.value)}
                  disabled={feesLoading || fees.length === 0}
                >
                  {availableInstallments.map((availableInstallment) => (
                    <option key={availableInstallment} value={availableInstallment}>
                      {availableInstallment}x
                    </option>
                  ))}
                </select>
              </label>
              </>
            )}

            {feesLoading ? (
              <p className="checkout-note">Carregando taxas...</p>
            ) : feesError ? (
              <p className="checkout-error" role="alert">{feesError}</p>
            ) : selectedFee ? (
              <div className="checkout-fee">
                <span>Taxa da plataforma</span>
                <strong>{Number(selectedFee.feePercent).toLocaleString('pt-BR')}%</strong>
                {feeAmount !== null && (
                  <span className="checkout-fee__estimate">
                    Valor estimado da taxa: {formatAmount(feeAmount)}
                  </span>
                )}
              </div>
            ) : (
              <p className="checkout-error" role="alert">
                Não há taxa configurada para este método ou número de parcelas.
              </p>
            )}

            {submitError && <p className="checkout-error" role="alert">{submitError}</p>}

            <button
              className="checkout-submit"
              type="submit"
              disabled={submitting || feesLoading || !selectedFee || numericAmount <= 0}
            >
              {submitting ? 'Criando checkout...' : 'Criar checkout'}
            </button>
          </div>
        </form>

        {createdCheckout && (
          <section className="content-card checkout-created" aria-live="polite">
            <div className="content-card__header">
              <div>
                <h2>Checkout criado</h2>
                <p>O checkout foi registrado pelo backend.</p>
              </div>
            </div>
            <dl className="checkout-details">
              <div><dt>Referência</dt><dd>{createdCheckout.externalReference}</dd></div>
              <div><dt>Valor</dt><dd>{formatAmount(createdCheckout.amount)}</dd></div>
              <div><dt>Método</dt><dd>{methods[createdCheckout.method] ?? createdCheckout.method}</dd></div>
              <div><dt>Status</dt><dd>{statuses[createdCheckout.status] ?? createdCheckout.status}</dd></div>
            </dl>
            {createdCheckout.method === 'PIX' &&
              (createdCheckout.qrCodeBase64 || createdCheckout.emv) && (
                <div className="checkout-pix">
                  {createdCheckout.qrCodeBase64 ? (
                    <img
                      className="checkout-qr"
                      src={`data:image/png;base64,${createdCheckout.qrCodeBase64}`}
                      alt="QR Code Pix"
                    />
                  ) : (
                    <QRCodeSVG
                      className="checkout-qr"
                      value={createdCheckout.emv}
                      size={220}
                      level="M"
                      title="QR Code Pix"
                    />
                  )}
                  <p className="checkout-pix__notice">
                    Este QR Code é de simulação e não inicia um pagamento Pix real.
                  </p>
                </div>
              )}
            {createdCheckout.method === 'PIX' && createdCheckout.emv && (
              <label className="checkout-field checkout-emv">
                <span>Código Pix copia e cola</span>
                <textarea readOnly value={createdCheckout.emv} rows={3} />
              </label>
            )}
          </section>
        )}
      </div>

      <section className="content-card checkout-list">
        <div className="content-card__header">
          <div>
            <h2>Checkouts recentes</h2>
            <p>Lista carregada diretamente do backend.</p>
          </div>
        </div>
        {checkoutsError ? (
          <p className="checkout-message checkout-error" role="alert">{checkoutsError}</p>
        ) : checkoutsLoading ? (
          <p className="checkout-message">Carregando checkouts...</p>
        ) : checkouts.length === 0 ? (
          <p className="checkout-message">Nenhum checkout encontrado.</p>
        ) : (
          <div className="checkout-table-wrapper">
            <table className="checkout-table">
              <thead>
                <tr>
                  <th scope="col">Referência</th>
                  <th scope="col">Método</th>
                  <th scope="col">Criado em</th>
                  <th scope="col">Status</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {checkouts.map((checkout) => (
                  <tr key={checkout.id}>
                    <td>{checkout.externalReference}</td>
                    <td>{methods[checkout.method] ?? checkout.method}</td>
                    <td>{formatDate(checkout.createdAt)}</td>
                    <td>
                      <span className={`checkout-status checkout-status--${checkout.status.toLowerCase()}`}>
                        {statuses[checkout.status] ?? checkout.status}
                      </span>
                    </td>
                    <td>{formatAmount(checkout.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}