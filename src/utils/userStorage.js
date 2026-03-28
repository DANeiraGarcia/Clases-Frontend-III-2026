const STORAGE_KEY = 'users';
const SESSION_KEY = 'currentUser';

export function loadUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUser(user) {
  const users = loadUsers();
  const exists = users.find((u) => u.email === user.email);
  if (exists) return { success: false, message: 'El correo ya está registrado.' };

  const newUser = {
    id: `USR-${Date.now()}`,
    name: user.name,
    email: user.email,
    password: user.password,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, newUser]));
  return { success: true, user: newUser };
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Correo o contraseña incorrectos.' };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function loadCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function logoutUser() {
  window.localStorage.removeItem(SESSION_KEY);
}

export const USERS_STORAGE_KEY = STORAGE_KEY;