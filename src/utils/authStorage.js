const USERS_STORAGE_KEY = 'authUsers';
const SESSION_STORAGE_KEY = 'authSession';

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

export function loadUsers() {
  return readStorageArray(USERS_STORAGE_KEY)
    .map(normalizeUser)
    .filter((user) => user.id && user.name && user.email && user.password);
}

export function saveUsers(users) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedUsers = Array.isArray(users) ? users.map(normalizeUser) : [];
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalizedUsers));
}

export function findUserByEmail(email) {
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();
  return loadUsers().find((user) => user.email === normalizedEmail) ?? null;
}

export function createUser(userData) {
  const nextUser = normalizeUser({
    ...userData,
    id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  });
  const currentUsers = loadUsers();

  saveUsers([...currentUsers, nextUser]);

  return sanitizeSessionUser(nextUser);
}

export function updateUser(userId, updates) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return null;
  }

  let updatedSessionUser = null;
  const nextUsers = loadUsers().map((user) => {
    if (user.id !== normalizedUserId) {
      return user;
    }

    const updatedUser = normalizeUser({ ...user, ...updates, id: user.id });
    updatedSessionUser = sanitizeSessionUser(updatedUser);
    return updatedUser;
  });

  saveUsers(nextUsers);

  if (updatedSessionUser) {
    saveSessionUser(updatedSessionUser);
  }

  return updatedSessionUser;
}

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

export function clearSessionUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export { SESSION_STORAGE_KEY, USERS_STORAGE_KEY };