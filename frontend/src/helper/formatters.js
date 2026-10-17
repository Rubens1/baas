export const formatCentsToBRL = (cents) => {
  if (isNaN(cents)) return 'R$ 0,00';
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const parseBRLToCents = (amount) => {
  return Math.round(Number(amount) * 100);
};