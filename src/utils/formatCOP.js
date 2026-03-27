export function formatCOP(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return '$ 0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}