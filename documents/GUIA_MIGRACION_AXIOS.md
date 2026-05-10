# Guía de migración — De `fetch` nativo a Axios

Este documento describe paso a paso cómo se migró el proyecto desde `fetch` nativo a Axios.
Cada sección corresponde a un commit atómico en la rama `desarrollo`.
El proyecto base (con `fetch`) queda preservado en la rama `inicio`.

---

## Contexto del proyecto

- Backend: Spring Boot en `http://localhost:8081/api/v1`
- Autenticación: Bearer token opaco almacenado en `localStorage`
- La URL del backend se configura en `src/config.js` usando la variable de entorno `VITE_API_URL`

---

## ¿Por qué Axios?

| Aspecto        | `fetch` nativo                                              | Axios                                                         |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Respuesta      | Hay que llamar `.json()` manualmente                        | La respuesta ya viene en `res.data`                           |
| Errores HTTP   | `fetch` no lanza error en 4xx/5xx, hay que revisar `res.ok` | Axios lanza excepción automáticamente — el `catch` lo captura |
| Headers        | Se repiten en cada llamada                                  | Un interceptor los agrega una sola vez para toda la app       |
| `Content-Type` | Hay que declararlo en cada POST/PATCH/PUT                   | Axios lo agrega automáticamente en JSON                       |

---

## Convenciones de ESLint que debes respetar

El proyecto usa **`eslint-plugin-import`**. Sigue siempre este orden de imports:

```
// 1. React y hooks de React
import { useState } from 'react';
// 2. Librerías externas (react-router-dom, etc.)
import { useNavigate } from 'react-router-dom';
// (línea en blanco)
// 3. Módulos internos: axiosClient, hooks, components, utils, pages
import axiosClient from '../../lib/axiosClient';
import useAuth from '../../hooks/useAuth';
// (línea en blanco)
// 4. CSS Modules
import styles from './MiComponente.module.css';
```

**Flujo de commit recomendado:**

```bash
npx eslint <archivo-modificado> --fix   # auto-corrige import/order y prettier
npm run lint                            # verifica exit 0
npm run build                           # verifica que Vite compile sin errores
git add <archivo>
git commit -m "feat(...): descripción"
```

---

## Estructura de ramas Git

```
main
├── inicio   ← base del proyecto con fetch nativo (punto de partida)
└── desarrollo ← todos los commits de la migración a Axios
```

Para inicializar el repositorio partiendo del proyecto base:

```bash
git init
git add .
git commit -m "feat: commit inicial - base del proyecto con fetch nativo"
git branch inicio
git checkout -b desarrollo
```

> La rama `inicio` conserva el estado original. La rama `desarrollo` es donde se trabaja.

---

## Commit 1 — Instalar Axios y crear el cliente centralizado

**Archivos:** `package.json`, `src/lib/axiosClient.js` (nuevo)

### Instalar Axios

```bash
npm install axios
```

Esto agrega `axios` a las dependencias en `package.json`.

### `src/lib/axiosClient.js`

Este archivo es el núcleo de la migración. Crea una instancia de Axios configurada con:

- La URL base del backend (`baseURL`)
- Un **interceptor de peticiones** que lee el token de `localStorage` y agrega el header `Authorization: Bearer <token>` automáticamente en cada llamada

```js
import axios from 'axios';

import { API_URL } from '../config';

// Clave usada en localStorage para guardar la sesión (debe coincidir con AuthContext)
const SESSION_KEY = 'session';

// Instancia de Axios preconfigurada para todas las peticiones al backend
const axiosClient = axios.create({
  baseURL: API_URL,
});

// Interceptor de peticiones: agrega el token de autorización automáticamente
// Lee la sesión desde localStorage para no depender de props ni contexto
axiosClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    // Si localStorage no está disponible, continúa sin token
  }
  return config;
});

export default axiosClient;
```

> **¿Por qué el interceptor?** Sin él, cada llamada tendría que agregar manualmente
> `headers: { Authorization: \`Bearer ${token}\` }`. Con el interceptor, esto ocurre
> de forma automática y transparente en toda la aplicación.

```bash
npx eslint src/lib/axiosClient.js --fix
npm run lint
npm run build
git add package.json package-lock.json src/lib/axiosClient.js
git commit -m "feat(lib): instalar axios y crear axiosClient con interceptor de token"
```

---

## Commit 2 — Migrar AuthContext

**Archivo:** `src/contexts/AuthContext.jsx`

### ¿Qué cambia?

El contexto usaba `fetch` para llamar a `POST /auth/logout`. Se reemplaza con `axiosClient`.

Como el interceptor lee el token de `localStorage` **antes** de que `logout` lo elimine,
el token se envía correctamente en la cabecera de la petición de logout.

### Cambios en el archivo

**Antes:**

```jsx
import { API_URL } from '../config';
// ...
await fetch(`${API_URL}/auth/logout`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.token}` },
});
```

**Después:**

```jsx
import axiosClient from '../lib/axiosClient';
// ...
// El interceptor agrega el token automáticamente desde localStorage
await axiosClient.post('/auth/logout');
```

> Se eliminó el import de `API_URL`. La URL base ya la conoce `axiosClient`.
> Se eliminaron los headers manuales — el interceptor los agrega automáticamente.

```bash
npx eslint src/contexts/AuthContext.jsx --fix
npm run lint
npm run build
git add src/contexts/AuthContext.jsx
git commit -m "feat(auth): migrar AuthContext logout de fetch a axiosClient"
```

---

## Commit 3 — Migrar Login y Register

**Archivos:** `src/pages/auth/Login.jsx`, `src/pages/auth/Register.jsx`

### Diferencia clave con Axios en manejo de errores

Con `fetch`, los errores HTTP (401, 400, etc.) **no lanzan excepción** — hay que revisar `res.ok`:

```jsx
// Con fetch
const res = await fetch(url, { method: 'POST', headers: {...}, body: JSON.stringify(data) });
const data = await res.json();
if (!res.ok) {
  setError(data.message ?? 'Error');
  return;
}
login(data);
```

Con Axios, los errores HTTP **sí lanzan excepción** y van directo al bloque `catch`. El mensaje de error del backend llega en `err.response.data.message`:

```jsx
// Con Axios
const res = await axiosClient.post(url, data);
login(res.data);   // si llegó aquí, fue exitoso
// el catch captura errores de red Y errores HTTP (4xx, 5xx)
catch (err) {
  setError(err.response?.data?.message ?? 'Error');
}
```

### `src/pages/auth/Login.jsx`

**Antes:**

```jsx
import { API_URL } from '../../config';
// ...
const res = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, guestCartId }),
});
const data = await res.json();
if (!res.ok) {
  setError(data.message ?? 'Credenciales inválidas.');
  return;
}
login(data);
// ...
} catch {
  setError('No se pudo conectar con el servidor. Intenta de nuevo.');
}
```

**Después:**

```jsx
import axiosClient from '../../lib/axiosClient';
// ...
// Con Axios: lanza excepción si el servidor responde con error (4xx, 5xx)
// La respuesta exitosa llega directamente en res.data
const res = await axiosClient.post('/auth/login', {
  email: values.email.trim(),
  password: values.password,
  guestCartId: cartId ?? undefined,
});
login(res.data);
// ...
} catch (err) {
  setError(err.response?.data?.message ?? 'Credenciales inválidas.');
}
```

### `src/pages/auth/Register.jsx`

Mismo patrón que Login:

**Antes:**

```jsx
import { API_URL } from '../../config';
// ...
const res = await fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, firstName, lastName, guestCartId }),
});
const data = await res.json();
if (!res.ok) {
  setError(data.message ?? 'No se pudo crear la cuenta.');
  return;
}
login(data);
// ...
} catch {
  setError('No se pudo conectar con el servidor. Intenta de nuevo.');
}
```

**Después:**

```jsx
import axiosClient from '../../lib/axiosClient';
// ...
const res = await axiosClient.post('/auth/register', {
  email: values.email.trim(),
  password: values.password,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  guestCartId: cartId ?? undefined,
});
login(res.data);
// ...
} catch (err) {
  setError(err.response?.data?.message ?? 'No se pudo crear la cuenta.');
}
```

```bash
npx eslint src/pages/auth/Login.jsx src/pages/auth/Register.jsx --fix
npm run lint
npm run build
git add src/pages/auth/Login.jsx src/pages/auth/Register.jsx
git commit -m "feat(auth): migrar Login y Register de fetch a axiosClient"
```

---

## Commit 4 — Migrar App.jsx (sesión guest y carrito)

**Archivo:** `src/App.jsx`

`App.jsx` tiene cinco llamadas a la API: sesión guest, carga del carrito, agregar item,
actualizar cantidad, eliminar item y vaciar carrito.

### Cambios en imports

**Antes:**

```jsx
import { API_URL } from './config';
import useAuth from './hooks/useAuth';
```

**Después:**

```jsx
import useAuth from './hooks/useAuth';
import axiosClient from './lib/axiosClient';
```

### Sesión guest (`.then()` encadenado)

**Antes:**

```jsx
fetch(`${API_URL}/auth/guest-session`, { method: 'POST' })
  .then((res) => res.json())
  .then((data) => login(data))
  .catch(() => {});
```

**Después:**

```jsx
axiosClient
  .post('/auth/guest-session')
  .then((res) => login(res.data))
  .catch(() => {});
```

### Carga del carrito

**Antes:**

```jsx
fetch(`${API_URL}/cart/me`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    if (Array.isArray(data.items)) {
      setCartItems(data.items.map(mapCartItem));
    }
  })
  .catch(() => {});
```

**Después:**

```jsx
axiosClient
  .get('/cart/me')
  .then((res) => {
    if (Array.isArray(res.data.items)) {
      setCartItems(res.data.items.map(mapCartItem));
    }
  })
  .catch(() => {});
```

### Handlers async del carrito (`async/await`)

Con fetch había que revisar `res.ok` antes de usar los datos. Con Axios basta verificar
que los datos sean del tipo esperado — si hubo error, ya fue capturado por el `catch`.

**Antes (agregar al carrito):**

```jsx
const res = await fetch(`${API_URL}/cart/items`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ productId: product.id, quantity: 1 }),
});
const data = await res.json();
if (res.ok && Array.isArray(data.items)) {
  setCartItems(data.items.map(mapCartItem));
}
```

**Después:**

```jsx
const res = await axiosClient.post('/cart/items', { productId: product.id, quantity: 1 });
if (Array.isArray(res.data.items)) {
  setCartItems(res.data.items.map(mapCartItem));
}
```

**Antes (actualizar cantidad):**

```jsx
const res = await fetch(`${API_URL}/cart/items/${productId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ quantity: Math.max(1, nextQuantity) }),
});
const data = await res.json();
if (res.ok && Array.isArray(data.items)) {
  setCartItems(data.items.map(mapCartItem));
}
```

**Después:**

```jsx
const res = await axiosClient.patch(`/cart/items/${productId}`, {
  quantity: Math.max(1, nextQuantity),
});
if (Array.isArray(res.data.items)) {
  setCartItems(res.data.items.map(mapCartItem));
}
```

**Antes (eliminar item):**

```jsx
const res = await fetch(`${API_URL}/cart/items/${productId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
if (res.ok && Array.isArray(data.items)) {
  setCartItems(data.items.map(mapCartItem));
}
```

**Después:**

```jsx
const res = await axiosClient.delete(`/cart/items/${productId}`);
if (Array.isArray(res.data.items)) {
  setCartItems(res.data.items.map(mapCartItem));
}
```

**Antes (vaciar carrito):**

```jsx
await fetch(`${API_URL}/cart/items`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
setCartItems([]);
```

**Después:**

```jsx
await axiosClient.delete('/cart/items');
setCartItems([]);
```

```bash
npx eslint src/App.jsx --fix
npm run lint
npm run build
git add src/App.jsx
git commit -m "feat(cart): migrar App.jsx de fetch a axiosClient (sesion guest y handlers del carrito)"
```

---

## Commit 5 — Migrar páginas de tienda (Home, ProductList, CategoryProducts)

**Archivos:** `src/pages/shop/Home.jsx`, `src/pages/shop/ProductList.jsx`,
`src/pages/shop/CategoryProducts.jsx`

Estas tres páginas solo tienen un `useEffect` con una llamada GET. El patrón es idéntico en todas:

**Antes:**

```jsx
import { API_URL } from '../../config';
// ...
fetch(`${API_URL}/products`)
  .then((res) => res.json())
  .then((data) => setProductsState(Array.isArray(data) ? data : []))
  .catch(() => {})
  .finally(() => setLoading(false));
```

**Después:**

```jsx
import axiosClient from '../../lib/axiosClient';
// ...
axiosClient
  .get('/products')
  .then((res) => setProductsState(Array.isArray(res.data) ? res.data : []))
  .catch(() => {})
  .finally(() => setLoading(false));
```

> `CategoryProducts.jsx` filtra por categoría añadiendo el query param en la URL:
>
> ```jsx
> axiosClient.get(`/products?categoryId=${categoryId}`);
> ```

```bash
npx eslint src/pages/shop/Home.jsx src/pages/shop/ProductList.jsx src/pages/shop/CategoryProducts.jsx --fix
npm run lint
npm run build
git add src/pages/shop/Home.jsx src/pages/shop/ProductList.jsx src/pages/shop/CategoryProducts.jsx
git commit -m "feat(shop): migrar Home, ProductList y CategoryProducts de fetch a axiosClient"
```

---

## Commit 6 — Migrar Checkout

**Archivo:** `src/pages/shop/Checkout.jsx`

Checkout hace dos llamadas encadenadas: primero crea la dirección, luego confirma la orden.
Con `fetch` también requería revisar `res.ok` y lanzar errores manualmente.

### Cambios en imports

**Antes:**

```jsx
import { API_URL } from '../../config';
import useAuth from '../../hooks/useAuth';
```

**Después:**

```jsx
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../lib/axiosClient';
```

### Destructuring de `useAuth`

Como `axiosClient` maneja el token automáticamente, `token` ya no se necesita en este componente.
Solo se necesita `cartId` para el payload del checkout.

**Antes:**

```jsx
const { token, cartId } = useAuth();
```

**Después:**

```jsx
const { cartId } = useAuth();
```

### `handleSubmit`

**Antes:**

```jsx
// 1. Crear dirección
const addrRes = await fetch(`${API_URL}/users/me/addresses`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ type: 'SHIPPING', line1, city, state, country, postalCode, isDefault: false }),
});
if (!addrRes.ok) throw new Error('No se pudo guardar la dirección.');
const addr = await addrRes.json();
const addressId = addr.id;

// 2. Confirmar orden
const orderRes = await fetch(`${API_URL}/orders/checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ cartId, shippingAddressId: addressId, billingAddressId: addressId }),
});
if (!orderRes.ok) throw new Error('No se pudo crear la orden.');
const order = await orderRes.json();
onCompleteCheckout(order);
navigate('/order-confirmation');

} catch (err) {
  setSubmitError(err.message ?? 'Ocurrió un error al procesar la orden.');
}
```

**Después:**

```jsx
// 1. Crear dirección — el interceptor agrega el token automáticamente
const addrRes = await axiosClient.post('/users/me/addresses', {
  type: 'SHIPPING',
  line1: values.line1.trim(),
  city: values.city.trim(),
  state: values.state.trim(),
  country: values.country.trim(),
  postalCode: values.postalCode.trim(),
  isDefault: false,
});
const addressId = addrRes.data.id;

// 2. Confirmar orden
const orderRes = await axiosClient.post('/orders/checkout', {
  cartId,
  shippingAddressId: addressId,
  billingAddressId: addressId,
});
onCompleteCheckout(orderRes.data);
navigate('/order-confirmation');

} catch (err) {
  setSubmitError(err.response?.data?.message ?? err.message ?? 'Ocurrió un error al procesar la orden.');
}
```

> Notar `err.response?.data?.message` — cuando Axios lanza la excepción por un error HTTP,
> el body de respuesta del backend viene en `err.response.data`.

```bash
npx eslint src/pages/shop/Checkout.jsx --fix
npm run lint
npm run build
git add src/pages/shop/Checkout.jsx
git commit -m "feat(checkout): migrar Checkout de fetch a axiosClient"
```

---

## Commit 7 — Migrar páginas de cuenta (UserOrders, OrderDetail, UserProfile)

**Archivos:** `src/pages/account/UserOrders.jsx`, `src/pages/account/OrderDetail.jsx`,
`src/pages/account/UserProfile.jsx`

### Patrón común

**Antes:**

```jsx
import { API_URL } from '../../config';
// ...
fetch(`${API_URL}/orders/me`, { headers: { Authorization: `Bearer ${token}` } })
  .then((res) => res.json())
  .then((data) => setOrders(Array.isArray(data) ? data : []))
  .catch(() => {})
  .finally(() => setLoading(false));
```

**Después:**

```jsx
import axiosClient from '../../lib/axiosClient';
// ...
axiosClient
  .get('/orders/me')
  .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
  .catch(() => {})
  .finally(() => setLoading(false));
```

> El guard `if (!token) return;` **se mantiene** en `UserOrders` y `OrderDetail`.
> Aunque el interceptor ya no necesita el token para agregarlo al header, el guard
> evita hacer llamadas innecesarias cuando no hay sesión activa.

### `UserProfile.jsx` — dos llamadas independientes

**Antes:**

```jsx
fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  .then((res) => (res.ok ? res.json() : null))
  .then((data) => setProfile(data))
  .catch(() => {});

fetch(`${API_URL}/orders/me`, { headers: { Authorization: `Bearer ${token}` } })
  .then((res) => res.json())
  .then((data) => setOrders(Array.isArray(data) ? data : []))
  .catch(() => {});
```

**Después:**

```jsx
axiosClient
  .get('/auth/me')
  .then((res) => setProfile(res.data))
  .catch(() => {});

axiosClient
  .get('/orders/me')
  .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
  .catch(() => {});
```

```bash
npx eslint src/pages/account/UserOrders.jsx src/pages/account/OrderDetail.jsx src/pages/account/UserProfile.jsx --fix
npm run lint
npm run build
git add src/pages/account/UserOrders.jsx src/pages/account/OrderDetail.jsx src/pages/account/UserProfile.jsx
git commit -m "feat(account): migrar UserOrders, OrderDetail y UserProfile de fetch a axiosClient"
```

---

## Commit 8 — Migrar panel admin (AdminDashboard, AdminProducts)

**Archivos:** `src/pages/admin/AdminDashboard.jsx`, `src/pages/admin/AdminProducts.jsx`

### `AdminDashboard.jsx`

**Antes:**

```jsx
import { API_URL } from '../../config';
// ...
fetch(`${API_URL}/products`).then(res => res.json()).then(data => setProducts(...)).catch(() => {});
fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
  .then(res => res.json()).then(data => setUsers(...)).catch(() => {});
```

**Después:**

```jsx
import axiosClient from '../../lib/axiosClient';
// ...
axiosClient
  .get('/products')
  .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
  .catch(() => {});
axiosClient
  .get('/admin/users')
  .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
  .catch(() => {});
```

### `AdminProducts.jsx` — CRUD completo

Este componente realizaba POST, PUT y DELETE con headers manuales. Con Axios todo se simplifica:

**Antes (crear):**

```jsx
const { token } = useAuth();
// ...
const res = await fetch(`${API_URL}/admin/products`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(product),
});
if (!res.ok) return;
const created = await res.json();
setProductsState((prev) => [...prev, created]);
```

**Después:**

```jsx
// useAuth ya no se importa en este componente
const res = await axiosClient.post('/admin/products', product);
setProductsState((prev) => [...prev, res.data]);
```

**Antes (eliminar):**

```jsx
const res = await fetch(`${API_URL}/admin/products/${productId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) return;
setProductsState((prev) => prev.filter((p) => p.id !== productId));
```

**Después:**

```jsx
await axiosClient.delete(`/admin/products/${productId}`);
setProductsState((prev) => prev.filter((p) => p.id !== productId));
```

**Antes (editar):**

```jsx
const res = await fetch(`${API_URL}/admin/products/${updatedProduct.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(updatedProduct),
});
if (!res.ok) return;
const saved = await res.json();
```

**Después:**

```jsx
const res = await axiosClient.put(`/admin/products/${updatedProduct.id}`, updatedProduct);
const saved = res.data;
```

> En `AdminProducts.jsx`, el import de `useAuth` se eliminó completamente porque
> `token` era el único campo que se extraía y ya no se necesita.

```bash
npx eslint src/pages/admin/AdminDashboard.jsx src/pages/admin/AdminProducts.jsx --fix
npm run lint
npm run build
git add src/pages/admin/AdminDashboard.jsx src/pages/admin/AdminProducts.jsx
git commit -m "feat(admin): migrar AdminDashboard y AdminProducts de fetch a axiosClient"
```

---

## Resumen de cambios por archivo

| Archivo                               | Cambio principal                                           |
| ------------------------------------- | ---------------------------------------------------------- |
| `src/lib/axiosClient.js`              | **Nuevo** — instancia Axios + interceptor de token         |
| `src/contexts/AuthContext.jsx`        | `fetch` → `axiosClient.post('/auth/logout')`               |
| `src/pages/auth/Login.jsx`            | `fetch` → `axiosClient.post`, error en `catch (err)`       |
| `src/pages/auth/Register.jsx`         | `fetch` → `axiosClient.post`, error en `catch (err)`       |
| `src/App.jsx`                         | 5 llamadas `fetch` → `axiosClient` (guest, carrito CRUD)   |
| `src/pages/shop/Home.jsx`             | `fetch` → `axiosClient.get`                                |
| `src/pages/shop/ProductList.jsx`      | `fetch` → `axiosClient.get`                                |
| `src/pages/shop/CategoryProducts.jsx` | `fetch` → `axiosClient.get` con query param                |
| `src/pages/shop/Checkout.jsx`         | 2 `fetch` → `axiosClient.post`, elimina `token` de useAuth |
| `src/pages/account/UserOrders.jsx`    | `fetch` → `axiosClient.get`                                |
| `src/pages/account/OrderDetail.jsx`   | `fetch` → `axiosClient.get`                                |
| `src/pages/account/UserProfile.jsx`   | 2 `fetch` → `axiosClient.get`                              |
| `src/pages/admin/AdminDashboard.jsx`  | 2 `fetch` → `axiosClient.get`                              |
| `src/pages/admin/AdminProducts.jsx`   | CRUD `fetch` → `axiosClient`, elimina `useAuth`            |

---

## Reglas de migración — resumen rápido

### Imports

```jsx
// Reemplazar
import { API_URL } from '../../config';

// Por
import axiosClient from '../../lib/axiosClient';
```

### GET

```jsx
// fetch
fetch(`${API_URL}/ruta`, { headers: { Authorization: `Bearer ${token}` } })
  .then((res) => res.json())
  .then((data) => setState(data));

// axiosClient
axiosClient.get('/ruta').then((res) => setState(res.data));
```

### POST / PATCH / PUT

```jsx
// fetch
await fetch(`${API_URL}/ruta`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(payload),
});

// axiosClient
await axiosClient.post('/ruta', payload);
// axiosClient.patch('/ruta/id', payload)
// axiosClient.put('/ruta/id', payload)
```

### DELETE

```jsx
// fetch
await fetch(`${API_URL}/ruta/id`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});

// axiosClient
await axiosClient.delete('/ruta/id');
```

### Manejo de errores HTTP

```jsx
// fetch — hay que revisar res.ok manualmente
const data = await res.json();
if (!res.ok) {
  setError(data.message ?? 'Error');
  return;
}

// axiosClient — el catch recibe el error automáticamente
} catch (err) {
  setError(err.response?.data?.message ?? 'Error genérico');
}
```

---

## Verificación final

```bash
npm run lint    # sin errores
npm run build   # build exitoso
```

Comprobar que no quede ningún `fetch` ni `API_URL` en los componentes:

```bash
grep -rn "fetch(" src/ --include="*.jsx" --include="*.js"
grep -rn "API_URL" src/ --include="*.jsx" --include="*.js"
# Solo deben aparecer: src/config.js y src/lib/axiosClient.js
```
