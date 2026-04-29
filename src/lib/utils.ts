/**
 * Retorna un string con el tiempo transcurrido desde la fecha dada hasta ahora.
 */
export function tiempoTranscurrido(fecha: string): string {
  const now = new Date();
  const created = new Date(fecha);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
  return `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
}

/**
 * Formatea una fecha a YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
