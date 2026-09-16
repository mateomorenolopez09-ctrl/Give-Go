/**
 * Format Colombian Pesos (COP) currency string
 */
export const formatCOP = (value: number): string => {
  const rounded = Math.round(value);
  const formatted = rounded.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${formatted}`;
};

/**
 * Format ISO date string into DD/MM/YYYY
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';

  if (dateStr.includes('/') && dateStr.split('/').length === 3) {
    const parts = dateStr.split('/');
    if (parts[0].length === 2 && parts[2].length === 4) {
      return dateStr;
    }
  }

  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const yyyy = parts[0];
    const mm = parts[1].padStart(2, '0');
    const dd = parts[2].padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return 'hace unos momentos';
};
