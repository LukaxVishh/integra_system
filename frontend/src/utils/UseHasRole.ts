// import { useAuth } from "./AuthContext";

// // Para verificar se tem uma role específica
// export const useHasRole = (role: string): boolean => {
//   const { roles, loading } = useAuth();
//   if (loading) return false;
//   return roles.includes(role);
// };

// // Para verificar se tem uma das roles permitidas
// export const useHasAnyRole = (allowedRoles: string[]): boolean => {
//   const { roles, loading } = useAuth();
//   if (loading) return false;
//   return allowedRoles.some(role => roles.includes(role));
// };
