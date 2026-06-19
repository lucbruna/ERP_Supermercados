export function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
    style: 'currency',
    currency: locale === 'en' ? 'USD' : 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string | number, locale: string): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatCpfCnpj(value: string, _locale?: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

export function formatPhone(value: string, _locale?: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
}

export function translateEnum<T extends string>(
  value: T,
  messages: Record<string, string>,
  _locale?: string,
): string {
  return messages[value] || value;
}
