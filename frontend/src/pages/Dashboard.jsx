import { useEffect, useState } from 'react'
import MetricIcon from '../components/MetricIcon'
import { api } from '../services/api'

const formatAmount = (amount) =>
  Number(amount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const formatDateTime = (value) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const transactionTypes = {
  PIX_IN: 'Pix',
  CARD_IN: 'Cartão',
  WITHDRAWAL: 'Saque',
  FEE: 'Taxa',
}

const transactionStatuses = {
  APPROVED: 'Aprovada',
  DENIED: 'Falhou',
  PENDING: 'Pendente',
}

export default function Dashboard({ onNavigate, user }) {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestError, setRequestError] = useState(false)
  const [formattedDate] = useState(() =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date()),
  )
  const firstName = user?.name?.trim().split(/\s+/)[0]

  useEffect(() => {
    let isCurrent = true

    const loadSummary = async () => {
      try {
        const response = await api.get('/wallet/summary')
        if (isCurrent) setSummary(response.data)
      } catch (error) {
        console.error('Erro ao carregar resumo da carteira:', error)
        if (isCurrent) setRequestError(true)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadSummary()
    return () => {
      isCurrent = false
    }
  }, [])

  const metrics = [
    {
      label: 'Saldo disponível',
      value: summary ? formatAmount(summary.balanceAvailable) : '—',
      change: summary
        ? `${formatAmount(summary.balanceBlocked)} bloqueados`
        : 'Saldo da carteira',
      icon: 'wallet',
    },
    {
      label: 'Total recebido',
      value: summary ? formatAmount(summary.receivedThisMonth) : '—',
      change: 'Neste mês, em vendas aprovadas',
      icon: 'arrow-down',
    },
    {
      label: 'Transações',
      value: summary ? String(summary.transactionsThisMonth) : '—',
      change: 'Neste mês',
      icon: 'activity',
    },
  ]

  return (
    <div className="dashboard">
      <section className="welcome">
        <div>
          <p className="eyebrow">{formattedDate}</p>
          <h1>Olá, {firstName || 'bem-vindo'} <span aria-hidden="true">✦</span></h1>
          <p className="welcome__description">Aqui está o resumo da sua conta hoje.</p>
        </div>
        <span className="date-filter" aria-label="Período do resumo: este mês">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M7.5 3v4m9-4v4M3.5 10h17" />
          </svg>
          Este mês
        </span>
      </section>

      <section aria-label="Resumo financeiro" className="metrics-grid">
        {metrics.map((metric, index) => (
          <article className="metric-card" key={metric.label}>
            <div className="metric-card__top">
              <span>{metric.label}</span>
              <span className={`metric-card__icon metric-card__icon--${index}`}>
                <MetricIcon name={metric.icon} />
              </span>
            </div>
            <strong className="metric-card__value">
              {loading ? 'Carregando...' : metric.value}
            </strong>
            <span className="metric-card__note">{metric.change}</span>
          </article>
        ))}
      </section>

      <section className="content-card">
        <div className="content-card__header">
          <div>
            <h2>Movimentações recentes</h2>
            <p>As últimas movimentações da sua carteira.</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('transactions')} type="button">
            Ver transações <span aria-hidden="true">→</span>
          </button>
        </div>
        {requestError ? (
          <p className="dashboard-message" role="alert">
            Não foi possível carregar o resumo da carteira. Tente novamente mais tarde.
          </p>
        ) : loading ? (
          <p className="dashboard-message">Carregando movimentações...</p>
        ) : summary.recentTransactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              <MetricIcon name="activity" />
            </span>
            <strong>Nenhuma movimentação por enquanto</strong>
            <span>Quando houver atividade na sua conta, os detalhes aparecerão aqui.</span>
          </div>
        ) : (
          <div className="dashboard-transactions-wrapper">
            <table className="dashboard-transactions">
              <thead>
                <tr>
                  <th scope="col">Movimentação</th>
                  <th scope="col">Data</th>
                  <th scope="col">Status</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transactionTypes[transaction.type] ?? transaction.type}</td>
                    <td>{formatDateTime(transaction.createdAt)}</td>
                    <td>
                      <span className={`transaction-status transaction-status--${transaction.status.toLowerCase()}`}>
                        {transactionStatuses[transaction.status] ?? transaction.status}
                      </span>
                    </td>
                    <td>{formatAmount(transaction.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
