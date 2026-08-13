/**
 * Los campos multipart/form-data llegan siempre como string (o array de
 * strings si se repite la key). Estos helpers normalizan esos valores a los
 * tipos reales esperados por los DTOs/entidades.
 */

export const parseArrayField = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;

  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
      } catch {
        // no era JSON válido, seguimos con el split por comas
      }
    }
    return trimmed
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return undefined;
};

export const parseIntField = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};
