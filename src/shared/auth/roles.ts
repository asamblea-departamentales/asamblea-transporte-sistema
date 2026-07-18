/** Lista privada y congelada de roles autorizados para jefatura */
const JEFATURA_ROLES: readonly string[] = Object.freeze([
  'jefe',
  'admin',
  'administrador',
  'super_admin',
  'ti'
]);

/**
 * Verifica si el usuario tiene acceso de jefatura.
 * Función pura, agnóstica a interfaces del dominio User.
 * 
 * @param roles - Array de roles (potencialmente inválido)
 * @returns true si al menos uno de los roles es válido y autorizado
 */
export const hasJefaturaAccess = (roles?: readonly unknown[]): boolean => {
  if (!roles || !Array.isArray(roles)) return false;

  return roles.some(role => {
    if (typeof role !== 'string') return false;
    const normalized = role.trim().toLowerCase();
    return JEFATURA_ROLES.some(valid => valid === normalized);
  });
};
