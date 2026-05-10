import { createContext, useMemo, useState } from 'react';

import axiosClient from '../lib/axiosClient';
import {
  clearSessionUser,
  createUser,
  findUserByEmail,
  loadSessionUser,
  saveSessionUser,
} from '../utils/authStorage';

// ─── CONTEXTO ────────────────────────────────────────────────────
// Crea el contexto de autenticación — es el "canal" por donde
// todos los componentes pueden acceder al usuario sin pasar props.
const AuthContext = createContext(null);

// ─── PROVEEDOR ───────────────────────────────────────────────────
// Componente que envuelve la app y provee el contexto a sus hijos.
// Carga el usuario de la sesión activa al iniciar.
function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSessionUser);

  // ─── REGISTRO ──────────────────────────────────────────────────
  // Valida los datos ingresados antes de crear la cuenta.
  // Si el correo ya existe, retorna error sin crear el usuario.
  // Si todo es válido, crea el usuario, guarda la sesión y actualiza el estado.
  const register = (backendResponse) => {
  const { sessionToken, user } = backendResponse;
  const sessionUser = { ...user, token: sessionToken };
  saveSessionUser(sessionUser);
  setCurrentUser(sessionUser);
};

  // ─── LOGIN ─────────────────────────────────────────────────────
  // Busca el usuario por correo y verifica la contraseña.
  // Si las credenciales son incorrectas, retorna error.
  // Si son válidas, guarda la sesión sin contraseña y actualiza el estado.
  const login = (backendResponse) => {
  const { sessionToken, user } = backendResponse;
  const sessionUser = { ...user, token: sessionToken };
  saveSessionUser(sessionUser);
  setCurrentUser(sessionUser);
};

  // ─── LOGOUT ────────────────────────────────────────────────────
  // Notifica al backend el logout y luego elimina la sesión local.
  // El interceptor agrega el token automáticamente desde localStorage.
  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch {
      // Si la llamada al backend falla, continúa con el logout local
    }
    clearSessionUser();
    setCurrentUser(null);
  };

  // ─── VALOR DEL CONTEXTO ────────────────────────────────────────
  // Agrupa todo lo que los componentes hijos pueden consumir:
  // el usuario actual, si está autenticado y las funciones de auth.
  // useMemo evita que se recalcule si currentUser no cambió.
  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      register,
    }),
    [currentUser]
  );

  // Provee el valor del contexto a todos los componentes hijos.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
