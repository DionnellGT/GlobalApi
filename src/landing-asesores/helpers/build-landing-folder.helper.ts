/**
 * Construye la ruta de carpeta en Cloudinary para un asesor:
 * "landing-asesores/{correo-del-usuario}/{subcarpeta}"
 *
 * Cloudinary crea las carpetas automáticamente a partir de los segmentos
 * del public_id, no requiere una llamada explícita para "crear" la carpeta.
 */
export const buildLandingFolder = (email: string, subfolder: string): string => {
  const normalizedEmail = email.trim().toLowerCase();
  return `landing-asesores/${normalizedEmail}/${subfolder}`;
};
