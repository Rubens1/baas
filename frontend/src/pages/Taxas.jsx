import { useEffect, useState } from 'react'
import { api } from '../services/api'

const methodLabels = {
  PIX: 'Pix',
  CARD: 'Cartão',
}

const formatPercent = (value) =>
  `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}%`

export default function Taxas() {
  const [method, setMethod] = useState('PIX')
  const [brand, setBrand] = useState('ALL')
  const [installments, setInstallments] = useState('1')
  const [feePercent, setFeePercent] = useState('')
  const [editingFeeId, setEditingFeeId] = useState(null)
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isCurrent = true

    api.get('/fees', { params: { method } })
      .then((response) => {
        if (isCurrent) setFees(response.data)
      })
      .catch((requestError) => {
        console.error('Erro ao carregar taxas:', requestError)
        if (isCurrent) setError(requestError.message || 'Não foi possível carregar as taxas.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [method])

  const handleMethodChange = (event) => {
    if (editingFeeId) return
    const nextMethod = event.target.value
    setMethod(nextMethod)
    setBrand('ALL')
    setInstallments('1')
    setLoading(true)
    setNotice('')
    setError('')
  }

  const handleEdit = (fee) => {
    setEditingFeeId(fee.id)
    setMethod(fee.method)
    setBrand(fee.brand)
    setInstallments(String(fee.installments))
    setFeePercent(String(fee.feePercent))
    setError('')
    setNotice('')
  }

  const cancelEdit = () => {
    setEditingFeeId(null)
    setFeePercent('')
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')

    try {
      const response = editingFeeId
        ? await api.patch(`/fees/${editingFeeId}`, { feePercent: Number(feePercent) })
        : await api.post('/fees', {
            method,
            brand: method === 'CARD' ? brand.trim().toUpperCase() || 'ALL' : 'ALL',
            installments: method === 'CARD' ? Number(installments) : 1,
            feePercent: Number(feePercent),
          })
      setFees((current) => {
        const exists = current.some((fee) => fee.id === response.data.id)
        const updated = exists
          ? current.map((fee) => fee.id === response.data.id ? response.data : fee)
          : [...current, response.data]
        return updated.sort((left, right) =>
          left.installments - right.installments || left.brand.localeCompare(right.brand),
        )
      })
      setEditingFeeId(null)
      setFeePercent('')
      setNotice('Taxa salva e disponível para novos checkouts.')
    } catch (requestError) {
      console.error('Erro ao cadastrar taxa:', requestError)
      setError(requestError.message || 'Não foi possível cadastrar a taxa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="checkout-page">
      <header className="checkout-page__header">
        <p className="eyebrow">Configurações financeiras</p>
        <h1>Taxas</h1>
        <p>Cadastre as taxas que serão aplicadas aos novos checkouts.</p>
      </header>

      <div className="checkout-layout">
        <form className="content-card" onSubmit={handleSubmit}>
          <div className="content-card__header">
            <div>
              <h2>{editingFeeId ? 'Editar taxa' : 'Cadastrar taxa'}</h2>
              <p>
                {editingFeeId
                  ? 'Altere o percentual. Método, bandeira e parcelas identificam esta taxa.'
                  : 'As taxas são aplicadas a novos checkouts; cobranças existentes mantêm a taxa original.'}
              </p>
            </div>
          </div>
          <div className="checkout-form__fields">
            <label className="checkout-field">
              <span>Método de pagamento</span>
              <select disabled={Boolean(editingFeeId)} value={method} onChange={handleMethodChange}>
                <option value="PIX">Pix</option>
                <option value="CARD">Cartão</option>
              </select>
            </label>

            {method === 'CARD' && (
              <>
                <label className="checkout-field">
                  <span>Bandeira</span>
                  <input
                    disabled={Boolean(editingFeeId)}
                    maxLength="32"
                    onChange={(event) => setBrand(event.target.value)}
                    placeholder="ALL para todas"
                    value={brand}
                  />
                </label>
                <label className="checkout-field">
                  <span>Parcelas</span>
                  <input
                    disabled={Boolean(editingFeeId)}
                    max="24"
                    min="1"
                    onChange={(event) => setInstallments(event.target.value)}
                    required
                    type="number"
                    value={installments}
                  />
                </label>
              </>
            )}

            <label className="checkout-field">
              <span>Taxa percentual</span>
              <span className="checkout-field__amount">
                <input
                  max="100"
                  min="0"
                  onChange={(event) => setFeePercent(event.target.value)}
                  placeholder="0,00"
                  required
                  step="0.0001"
                  type="number"
                  value={feePercent}
                />
                <span>%</span>
              </span>
            </label>

            {error && <p className="checkout-error" role="alert">{error}</p>}
            {notice && <p className="checkout-message" role="status">{notice}</p>}
            <div className="fee-form__actions">
              <button className="checkout-submit" disabled={submitting} type="submit">
                {submitting ? 'Salvando...' : editingFeeId ? 'Salvar alterações' : 'Cadastrar taxa'}
              </button>
              {editingFeeId && (
                <button className="fee-cancel" disabled={submitting} onClick={cancelEdit} type="button">
                  Cancelar edição
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="content-card" aria-label={`Taxas de ${methodLabels[method]}`}>
          <div className="content-card__header">
            <div>
              <h2>Taxas de {methodLabels[method]}</h2>
              <p>Configurações atualmente disponíveis para novos checkouts.</p>
            </div>
          </div>
          {loading ? (
            <p className="checkout-message" role="status" style={{ padding: 20 }}>Carregando taxas...</p>
          ) : error && fees.length === 0 ? (
            <p className="checkout-error" role="alert" style={{ padding: 20 }}>{error}</p>
          ) : fees.length === 0 ? (
            <p className="checkout-message" style={{ padding: 20 }}>Nenhuma taxa cadastrada para este método.</p>
          ) : (
            <div className="dashboard-transactions-wrapper">
              <table className="dashboard-transactions">
                <thead>
                  <tr>
                    <th scope="col">Método</th>
                    <th scope="col">Bandeira</th>
                    <th scope="col">Parcelas</th>
                    <th scope="col">Taxa</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id}>
                      <td>{methodLabels[fee.method] ?? fee.method}</td>
                      <td>{fee.brand}</td>
                      <td>{fee.installments}x</td>
                      <td>{formatPercent(fee.feePercent)}</td>
                      <td>
                        <button className="fee-edit" onClick={() => handleEdit(fee)} type="button">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
