///CRUD COMPLETO PARA USUARIOS EN LOCALSTORAGE CON NORMALIZACIÓN Y VALIDACIÓN ////

// Claves para identificar los datos en localStorage
const USERS_STORAGE_KEY = 'authUsers';
const SESSION_STORAGE_KEY = 'authSession';

// ─── NORMALIZACIÓN ───────────────────────────────────────────────
// Garantiza que cada campo del usuario tenga un formato limpio y consistente.
// El operador ?. accede a propiedades sin error si el objeto es null/undefined.
// El operador ?? retorna el valor derecho si el izquierdo es null/undefined.
const normalizeUser = (user) => ({
  id: String(user?.id ?? ''),
  name: String(user?.name ?? '').trim(),
  email: String(user?.email ?? '')
    .trim()
    .toLowerCase(),
  password: String(user?.password ?? ''),
  phone: String(user?.phone ?? '').trim(),
  address: String(user?.address ?? '').trim(),
  city: String(user?.city ?? '').trim(),
  postalCode: String(user?.postalCode ?? '').trim(),
});

// Versión del usuario sin contraseña — se usa para guardar la sesión activa.
// Si no tiene id o email válido, retorna null para evitar sesiones inválidas.
const sanitizeSessionUser = (user) => {
  const normalizedUser = normalizeUser(user);

  if (!normalizedUser.id || !normalizedUser.email) {
    return null;
  }

  return {
    id: normalizedUser.id,
    name: normalizedUser.name,
    email: normalizedUser.email,
    phone: normalizedUser.phone,
    address: normalizedUser.address,
    city: normalizedUser.city,
    postalCode: normalizedUser.postalCode,
  };
};

// ─── LECTURA GENÉRICA DEL LOCALSTORAGE ───────────────────────────
// Lee cualquier clave del localStorage y retorna un array.
// Si no existe, está vacío o tiene un formato inválido, retorna [].
const readStorageArray = (storageKey) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ─── CRUD DE USUARIOS ────────────────────────────────────────────
// Carga todos los usuarios del localStorage, los normaliza
// y filtra los que tengan los campos obligatorios completos.
export function loadUsers() {
  return readStorageArray(USERS_STORAGE_KEY)
    .map(normalizeUser)
    .filter((user) => user.id && user.name && user.email && user.password);
}

// Guarda el array completo de usuarios en localStorage,
// normalizando cada uno antes de escribirlo.
export function saveUsers(users) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedUsers = Array.isArray(users) ? users.map(normalizeUser) : [];
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalizedUsers));
}

// Busca un usuario por correo electrónico (insensible a mayúsculas).
// Retorna el usuario encontrado o null si no existe.
export function findUserByEmail(email) {
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();
  return loadUsers().find((user) => user.email === normalizedEmail) ?? null;
}

// Crea un nuevo usuario con un ID único basado en la fecha actual,
// lo agrega al array existente y lo guarda en localStorage.
// Retorna la versión sin contraseña para usar en sesión.
export function createUser(userData) {
  const nextUser = normalizeUser({
    ...userData,
    id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  });
  const currentUsers = loadUsers();

  saveUsers([...currentUsers, nextUser]);

  return sanitizeSessionUser(nextUser);
}

// Actualiza los datos de un usuario existente por su ID.
// Conserva el ID original para evitar duplicados.
// Si el usuario fue actualizado, también actualiza la sesión activa.
// Retorna la versión sin contraseña o null si no se encontró.
export function updateUser(userId, updates) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return null;
  }

  let updatedSessionUser = null;
  const nextUsers = loadUsers().map((user) => {
    if (user.id !== normalizedUserId) {  // se compara con el ID normalizado para evitar errores por espacios o tipos
      return user;
    }

    const updatedUser = normalizeUser({ ...user, ...updates, id: user.id });
    updatedSessionUser = sanitizeSessionUser(updatedUser);
    return updatedUser;
  });

  saveUsers(nextUsers); // se guarda en la lista de usuarios actualizada

  if (updatedSessionUser) {
    saveSessionUser(updatedSessionUser);
  }

  return updatedSessionUser;
}

// ─── GESTIÓN DE SESIÓN ───────────────────────────────────────────
// Carga el usuario de la sesión activa desde localStorage.
// Retorna null si no hay sesión o si los datos son inválidos.
export function loadSessionUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return sanitizeSessionUser(JSON.parse(stored));
  } catch {
    return null;
  }
}

// Guarda el usuario activo en localStorage sin su contraseña.
// Si el usuario no es válido, LIMPIA la sesión en lugar de guardar datos inválidos.
export function saveSessionUser(user) {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitizedUser = sanitizeSessionUser(user);

  if (!sanitizedUser) {
    clearSessionUser();
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sanitizedUser));
}

// Elimina la sesión activa del localStorage — equivale a cerrar sesión.
export function clearSessionUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Exporta las claves de localStorage para usarlas en otros archivos si es necesario.
export { SESSION_STORAGE_KEY, USERS_STORAGE_KEY };