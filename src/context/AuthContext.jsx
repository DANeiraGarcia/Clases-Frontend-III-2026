import { createContext, useMemo, useState } from 'react';

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
  const register = ({ name, email, password }) => {
    const normalizedEmail = String(email ?? '')
      .trim()
      .toLowerCase();

    if (!name?.trim()) {
      return { ok: false, error: 'Ingresa un nombre para crear la cuenta.' };
    }

    if (!normalizedEmail) {
      return { ok: false, error: 'Ingresa un correo electrónico válido.' };
    }

    if (!password || password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    if (findUserByEmail(normalizedEmail)) {
      return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
    }
     // si todo es valido se crea el usuario.
    const user = createUser({ name: name.trim(), email: normalizedEmail, password });
    saveSessionUser(user);
    setCurrentUser(user);

    return { ok: true, user };
  };

  // ─── LOGIN ─────────────────────────────────────────────────────
  // Busca el usuario por correo y verifica la contraseña.
  // Si las credenciales son incorrectas, retorna error.
  // Si son válidas, guarda la sesión sin contraseña y actualiza el estado.
  const login = ({ email, password }) => {
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return { ok: false, error: 'Credenciales inválidas. Verifica correo y contraseña.' };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
    };

    saveSessionUser(sessionUser);
    setCurrentUser(sessionUser);

    return { ok: true, user: sessionUser };
  };

  // ─── LOGOUT ────────────────────────────────────────────────────
  // Elimina la sesión del localStorage y limpia el estado del usuario.
  const logout = () => {
    clearSessionUser();
    setCurrentUser(null); // pone la sesion por defecto en null, es decir, sin usuario.
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