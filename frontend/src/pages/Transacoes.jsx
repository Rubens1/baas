import { useState, useEffect } from 'react';
import { api } from '../services/api';

const formatAmountToBRL = (amount) =>
  Number(amount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const loadTransactions = async () => {
      try {
        const response = await api.get('/wallet/transactions', {
          params: { status: statusFilter }
        });
        if (isCurrent) setTransacoes(response.data);
      } catch (error) {
        console.error('Erro ao carregar extrato:', error);
        if (isCurrent) setRequestError(true);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadTransactions();
    return () => {
      isCurrent = false;
    };
  }, [statusFilter]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Extrato e Transações</h2>

      {/* Filtros conforme especificação do PDF */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filtrar por Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => {
            setLoading(true);
            setRequestError(false);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="">Todos os Status</option>
          <option value="APPROVED">Aprovado (APPROVED)</option>
          <option value="DENIED">Falha (DENIED)</option>
          <option value="PENDING">Pendente (PENDING)</option>
        </select>
      </div>

      {loading ? (
        <p>Carregando transações...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID / Ref</th>
              <th>Método</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {requestError ? (
              <tr>
                <td colSpan="5" role="alert" style={{ textAlign: 'center' }}>
                  Não foi possível carregar as transações. Tente novamente mais tarde.
                </td>
              </tr>
            ) : transacoes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Nenhuma transação encontrada.</td>
              </tr>
            ) : (
              transacoes.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.externalReference || tx.id}</td>
                  <td>{tx.type}</td>
                  <td>{formatAmountToBRL(tx.amount)}</td>
                  <td>
                    <strong>{tx.status}</strong>
                  </td>
                  <td>
                    {tx.status === 'APPROVED' && (
                      <button onClick={() => window.print()}>Comprovante</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}