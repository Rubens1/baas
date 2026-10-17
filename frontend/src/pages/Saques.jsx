import { useCallback, useEffect, useState } from 'react'
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

const withdrawalStatuses = {
  COMPLETED: 'Concluído',
  PENDING: 'Pendente',
  FAILED: 'Falhou',
}

const emptyPix = { key: '', keyType: 'CPF' }
const emptyAccount = {
  bank: '',
  branch: '',
  account: '',
  accountType: 'CHECKING',
  holderName: '',
  document: '',
}

export default function Saques() {
  const [wallet, setWallet] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [walletLoading, setWalletLoading] = useState(true)
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [walletError, setWalletError] = useState('')
  const [withdrawalsError, setWithdrawalsError] = useState('')
  const [destinationType, setDestinationType] = useState('PIX')
  const [amount, setAmount] = useState('')
  const [pix, setPix] = useState(emptyPix)
  const [account, setAccount] = useState(emptyAccount)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const fetchWallet = useCallback(async () => {
    const response = await api.get('/wallet')
    const balance = Number(response.data?.balanceAvailable)
    if (!Number.isFinite(balance)) {
      throw new Error('O backend não retornou um saldo disponível válido.')
    }
    return { ...response.data, balanceAvailable: balance }
  }, [])

  const fetchWithdrawals = useCallback(async () => {
    const response = await api.get('/withdrawals')
    return response.data
  }, [])

  const loadWallet = useCallback(async () => {
    try {
      setWallet(await fetchWallet())
      setWalletError('')
    } catch (error) {
      console.error('Erro ao carregar saldo da carteira:', error)
      setWallet(null)
      setWalletError(error.message || 'Não foi possível carregar o saldo da carteira.')
    } finally {
      setWalletLoading(false)
    }
  }, [fetchWallet])

  const loadWithdrawals = useCallback(async () => {
    try {
      setWithdrawals(await fetchWithdrawals())
      setWithdrawalsError('')
    } catch (error) {
      console.error('Erro ao carregar histórico de saques:', error)
      setWithdrawals([])
      setWithdrawalsError(error.message || 'Não foi possível carregar o histórico de saques.')
    } finally {
      setWithdrawalsLoading(false)
    }
  }, [fetchWithdrawals])

  const refreshData = useCallback(() => {
    setWalletLoading(true)
    setWithdrawalsLoading(true)
    setWalletError('')
    setWithdrawalsError('')
    loadWallet()
    loadWithdrawals()
  }, [loadWallet, loadWithdrawals])

  useEffect(() => {
    let isCurrent = true
    fetchWallet()
      .then((data) => {
        if (isCurrent) setWallet(data)
      })
      .catch((error) => {
        console.error('Erro ao carregar saldo da carteira:', error)
        if (isCurrent) {
          setWallet(null)
          setWalletError(error.message || 'Não foi possível carregar o saldo da carteira.')
        }
      })
      .finally(() => {
        if (isCurrent) setWalletLoading(false)
      })
    fetchWithdrawals()
      .then((data) => {
        if (isCurrent) setWithdrawals(data)
      })
      .catch((error) => {
        console.error('Erro ao carregar histórico de saques:', error)
        if (isCurrent) {
          setWithdrawals([])
          setWithdrawalsError(error.message || 'Não foi possível carregar o histórico de saques.')
        }
      })
      .finally(() => {
        if (isCurrent) setWithdrawalsLoading(false)
      })
    return () => {
      isCurrent = false
    }
  }, [fetchWallet, fetchWithdrawals])

  const availableBalance = wallet ? Number(wallet.balanceAvailable) : null
  const numericAmount = Number(amount)
  const amountIsValid = availableBalance !== null &&
    Number.isFinite(availableBalance) &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= availableBalance

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    const destinationData = destinationType === 'PIX'
      ? { key: pix.key.trim(), keyType: pix.keyType }
      : {
          bank: account.bank.trim(),
          branch: account.branch.trim(),
          account: account.account.trim(),
          accountType: account.accountType,
          holderName: account.holderName.trim(),
          document: account.document.trim(),
        }

    try {
      const response = await api.post('/withdrawals', {
        amount: numericAmount,
        destinationType,
        destinationData,
      })
      setWithdrawals((current) => [
        response.data,
        ...current.filter((withdrawal) => withdrawal.id !== response.data.id),
      ])
      setAmount('')
      setSuccessMessage(
        `Saque de ${formatAmount(response.data.amount)} ${withdrawalStatuses[response.data.status]?.toLowerCase() ?? 'criado'}.`,
      )
      refreshData()
    } catch (error) {
      console.error('Erro ao solicitar saque:', error)
      setSubmitError(error.message || 'Não foi possível solicitar o saque.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="withdrawals-page">
      <header className="withdrawals-page__header">
        <p className="eyebrow">Financeiro</p>
        <h1>Saques</h1>
        <p>Consulte seu saldo e solicite transferências da carteira.</p>
      </header>

      {walletError && (
        <p className="withdrawal-error" role="alert">
          {walletError}
          <button
            className="withdrawal-retry"
            onClick={() => {
              setWalletLoading(true)
              setWalletError('')
              loadWallet()
            }}
            type="button"
          >
            Recarregar saldo
          </button>
        </p>
      )}

      <section className="withdrawal-balance" aria-label="Saldo disponível">
        <span>Saldo disponível</span>
        <strong>
          {walletLoading && !wallet
            ? 'Carregando...'
            : availableBalance === null || !Number.isFinite(availableBalance)
              ? '—'
              : formatAmount(availableBalance)}
        </strong>
      </section>

      <form className="content-card withdrawal-form" onSubmit={handleSubmit}>
        <div className="content-card__header">
          <div>
            <h2>Solicitar saque</h2>
            <p>O backend debita o saldo e registra a transferência.</p>
          </div>
        </div>

        <div className="withdrawal-form__fields">
          <label className="checkout-field">
            <span>Valor do saque</span>
            <span className="checkout-field__amount">
              <span>R$</span>
              <input
                type="number"
                min="0.01"
                max={availableBalance ?? undefined}
                step="0.01"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </span>
          </label>

          <label className="checkout-field">
            <span>Tipo de destino</span>
            <select
              value={destinationType}
              onChange={(event) => setDestinationType(event.target.value)}
            >
              <option value="PIX">Pix</option>
              <option value="ACCOUNT">Conta bancária</option>
            </select>
          </label>

          {destinationType === 'PIX' ? (
            <div className="withdrawal-destination">
              <label className="checkout-field">
                <span>Tipo da chave Pix</span>
                <select
                  value={pix.keyType}
                  onChange={(event) => setPix((current) => ({ ...current, keyType: event.target.value }))}
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone</option>
                  <option value="RANDOM">Chave aleatória</option>
                </select>
              </label>
              <label className="checkout-field">
                <span>Chave Pix</span>
                <input
                  type="text"
                  autoComplete="off"
                  value={pix.key}
                  onChange={(event) => setPix((current) => ({ ...current, key: event.target.value }))}
                  required
                />
              </label>
            </div>
          ) : (
            <div className="withdrawal-destination withdrawal-destination--account">
              <label className="checkout-field">
                <span>Banco</span>
                <input
                  type="text"
                  value={account.bank}
                  onChange={(event) => setAccount((current) => ({ ...current, bank: event.target.value }))}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Agência</span>
                <input
                  type="text"
                  value={account.branch}
                  onChange={(event) => setAccount((current) => ({ ...current, branch: event.target.value }))}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Conta com dígito</span>
                <input
                  type="text"
                  value={account.account}
                  onChange={(event) => setAccount((current) => ({ ...current, account: event.target.value }))}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Tipo de conta</span>
                <select
                  value={account.accountType}
                  onChange={(event) => setAccount((current) => ({ ...current, accountType: event.target.value }))}
                >
                  <option value="CHECKING">Conta corrente</option>
                  <option value="SAVINGS">Conta poupança</option>
                </select>
              </label>
              <label className="checkout-field">
                <span>Nome do titular</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={account.holderName}
                  onChange={(event) => setAccount((current) => ({ ...current, holderName: event.target.value }))}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>CPF/CNPJ do titular</span>
                <input
                  type="text"
                  autoComplete="off"
                  value={account.document}
                  onChange={(event) => setAccount((current) => ({ ...current, document: event.target.value }))}
                  required
                />
              </label>
            </div>
          )}

          {submitError && <p className="withdrawal-error" role="alert">{submitError}</p>}
          {successMessage && <p className="withdrawal-success" role="status">{successMessage}</p>}
          <p className="withdrawal-note">
            O backend registra o saque em modo de simulação local e marca a operação como concluída.
          </p>

          <button
            className="checkout-submit"
            type="submit"
            disabled={walletLoading || !wallet || !Number.isFinite(availableBalance) || submitting || !amountIsValid ||
              (destinationType === 'PIX' ? !pix.key.trim() : Object.values(account).some((value) => !value.trim()))}
          >
            {submitting ? 'Processando saque...' : 'Solicitar saque'}
          </button>
        </div>
      </form>

      <section className="content-card withdrawal-history">
        <div className="content-card__header">
          <div>
            <h2>Saques recentes</h2>
            <p>Últimos 100 saques registrados na sua conta.</p>
          </div>
          <button
            className="text-button"
            onClick={refreshData}
            type="button"
            disabled={withdrawalsLoading || walletLoading}
          >
            Atualizar
          </button>
        </div>
        {withdrawalsError ? (
          <p className="withdrawal-message withdrawal-error" role="alert">
            {withdrawalsError}
          </p>
        ) : withdrawalsLoading ? (
          <p className="withdrawal-message">Carregando saques...</p>
        ) : withdrawals.length === 0 ? (
          <p className="withdrawal-message">Nenhum saque encontrado.</p>
        ) : (
          <div className="checkout-table-wrapper">
            <table className="checkout-table">
              <thead>
                <tr>
                  <th scope="col">Identificação</th>
                  <th scope="col">Destino</th>
                  <th scope="col">Data</th>
                  <th scope="col">Status</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td>{withdrawal.id}</td>
                    <td>{withdrawal.destinationType === 'PIX' ? 'Pix' : 'Conta bancária'}</td>
                    <td>{formatDate(withdrawal.createdAt)}</td>
                    <td>
                      <span className={`checkout-status checkout-status--${withdrawal.status.toLowerCase()}`}>
                        {withdrawalStatuses[withdrawal.status] ?? withdrawal.status}
                      </span>
                    </td>
                    <td>{formatAmount(withdrawal.amount)}</td>
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