# Contrato Frontend-Backend

> Documento generado a partir de los controllers y DTOs actuales del backend.
> Base path: `/api/v1`
> Estado: vigente según el código actual.

---

## 1. Autenticación actual

### Tipo de autenticación
- **Bearer token de sesión opaco**
- **No es JWT**
- **No es Basic Auth**

### Cómo se usa
1. El frontend hace login, registro o crea sesión guest.
2. El backend devuelve `sessionToken`.
3. El frontend envía ese token en cada request protegido:

```http
Authorization: Bearer <sessionToken>
```

### Respuesta de sesión esperada
```json
{
  "sessionToken": "a3f9b2c1-4d7e-4891-b843-2e1f5a234cd8",
  "sessionId": 101,
  "expiresAt": "2026-05-29T22:00:00",
  "user": {
    "id": 1,
    "email": "ada@cesde.edu.co",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "fullName": "Ada Lovelace",
    "role": "CUSTOMER",
    "phone": "3001234567",
    "status": "ACTIVE",
    "createdAt": "2026-04-29T10:30:00"
  },
  "cart": {
    "id": 42,
    "userId": 1,
    "userEmail": "ada@cesde.edu.co",
    "status": "OPEN",
    "isGuest": false,
    "createdAt": "2026-04-29T10:00:00",
    "updatedAt": "2026-04-29T10:45:00",
    "items": [],
    "summary": {
      "itemsCount": 0,
      "subtotal": 0,
      "tax": 0,
      "shipping": 0,
      "total": 0
    }
  }
}
```

---

## 2. Convenciones generales

### Error estándar esperado
```json
{
  "code": "UNAUTHORIZED",
  "message": "Authorization header is required",
  "details": [],
  "timestamp": "2026-05-08T10:00:00",
  "path": "/api/v1/auth/me"
}
```

### Códigos frecuentes
- `200 OK`: consulta o actualización exitosa
- `201 Created`: recurso creado
- `204 No Content`: operación exitosa sin body
- `400 Bad Request`: validación o payload inválido
- `401 Unauthorized`: token ausente, inválido o expirado / credenciales inválidas
- `403 Forbidden`: falta rol `ADMIN`
- `404 Not Found`: recurso no encontrado
- `409 Conflict`: duplicados, estados inválidos o conflictos de negocio

---

# 3. Endpoints

## 3.1 Auth

### POST `/api/v1/auth/guest-session`
- **Auth:** pública
- **Body:** sin body
- **Respuesta esperada:** `201 Created`

```json
{
  "sessionToken": "guest-session-token",
  "sessionId": 15,
  "expiresAt": "2026-05-09T10:00:00",
  "user": null,
  "cart": {
    "id": 15,
    "userId": null,
    "userEmail": null,
    "status": "OPEN",
    "isGuest": true,
    "createdAt": "2026-05-08T10:00:00",
    "updatedAt": "2026-05-08T10:00:00",
    "items": [],
    "summary": {
      "itemsCount": 0,
      "subtotal": 0,
      "tax": 0,
      "shipping": 0,
      "total": 0
    }
  }
}
```

### POST `/api/v1/auth/register`
- **Auth:** pública
- **Body esperado:**

```json
{
  "email": "maria@example.com",
  "password": "SecurePass99!",
  "firstName": "María",
  "lastName": "García",
  "phone": "+57 300 123 4567",
  "guestCartId": 42
}
```

- **Respuesta esperada:** `201 Created`
- **Respuesta:** `AuthSessionResponse`

### POST `/api/v1/auth/login`
- **Auth:** pública
- **Body esperado:**

```json
{
  "email": "ada@cesde.edu.co",
  "password": "secret123",
  "guestCartId": 42
}
```

- `guestCartId` es opcional.
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `AuthSessionResponse`

### GET `/api/v1/auth/me`
- **Auth:** `Bearer <sessionToken>`
- **Body:** sin body
- **Respuesta esperada:** `200 OK`

```json
{
  "id": 1,
  "email": "ada@cesde.edu.co",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "fullName": "Ada Lovelace",
  "role": "CUSTOMER",
  "phone": "3001234567",
  "status": "ACTIVE",
  "createdAt": "2026-04-29T10:30:00"
}
```

### POST `/api/v1/auth/logout`
- **Auth:** `Bearer <sessionToken>`
- **Body:** sin body
- **Respuesta esperada:** `204 No Content`

---

## 3.2 Categories

### GET `/api/v1/categories`
- **Auth:** pública
- **Body:** sin body
- **Respuesta esperada:** `200 OK`

```json
[
  {
    "id": 2,
    "parentId": 1,
    "parentName": "Ropa",
    "name": "Ropa Deportiva",
    "slug": "ropa-deportiva",
    "isRoot": false,
    "subcategoriesCount": 3,
    "productsCount": 25,
    "subcategories": null
  }
]
```

### GET `/api/v1/categories/tree`
- **Auth:** pública
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** lista de `CategoryResponse` con `subcategories` anidadas

### GET `/api/v1/categories/{id}`
- **Auth:** pública
- **Body:** sin body
- **Path params:** `id`
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `CategoryResponse`

### GET `/api/v1/categories/{id}/subcategories`
- **Auth:** pública
- **Body:** sin body
- **Path params:** `id`
- **Respuesta esperada:** `200 OK`
- **Respuesta:** lista de `CategoryResponse`

---

## 3.3 Products

### GET `/api/v1/products`
- **Auth:** pública
- **Body:** sin body
- **Query params opcionales:**
  - `search: string`
  - `categoryId: number`
  - `activeOnly: boolean` (default `true`)
- **Respuesta esperada:** `200 OK`

```json
[
  {
    "id": 5,
    "categoryId": 3,
    "categoryName": "Ropa Deportiva",
    "sku": "PROD-001-AZL",
    "name": "Camiseta Azul Talla M",
    "description": "Camiseta 100% algodón, color azul marino",
    "image": "https://cdn.example.com/img/camiseta-azul.jpg",
    "price": 49900.00,
    "stockQty": 150,
    "isActive": true,
    "isAvailable": true,
    "createdAt": "2026-04-01T09:00:00"
  }
]
```

### GET `/api/v1/products/{id}`
- **Auth:** pública
- **Body:** sin body
- **Path params:** `id`
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `ProductResponse`

---

## 3.4 Cart

> Requiere `Authorization: Bearer <sessionToken>`.
> Puede ser sesión **guest** o sesión **autenticada**, según el caso.

### GET `/api/v1/cart/me`
- **Auth:** Bearer sessionToken
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `CartResponse`

### POST `/api/v1/cart/items`
- **Auth:** Bearer sessionToken
- **Body esperado:**

```json
{
  "productId": 5,
  "quantity": 2
}
```

- **Respuesta esperada:** `200 OK`
- **Respuesta:** `CartResponse`

### PATCH `/api/v1/cart/items/{productId}`
- **Auth:** Bearer sessionToken
- **Path params:** `productId`
- **Body esperado:**

```json
{
  "quantity": 3
}
```

- **Respuesta esperada:** `200 OK`
- **Respuesta:** `CartResponse`

### DELETE `/api/v1/cart/items/{productId}`
- **Auth:** Bearer sessionToken
- **Path params:** `productId`
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `CartResponse`

### DELETE `/api/v1/cart/items`
- **Auth:** Bearer sessionToken
- **Body:** sin body
- **Respuesta esperada:** `204 No Content`

### POST `/api/v1/cart/merge`
- **Auth:** Bearer sessionToken
- **Body esperado:**

```json
{
  "guestCartId": 15
}
```

- **Respuesta esperada:** `200 OK`
- **Respuesta:** `CartResponse`

### Estructura esperada de `CartResponse`
```json
{
  "id": 42,
  "userId": 1,
  "userEmail": "juan@example.com",
  "status": "OPEN",
  "isGuest": false,
  "createdAt": "2026-04-29T10:00:00",
  "updatedAt": "2026-04-29T10:45:00",
  "items": [
    {
      "id": 201,
      "productId": 5,
      "sku": "PROD-001-AZL",
      "name": "Camiseta Azul Talla M",
      "image": "https://cdn.example.com/img/camiseta-azul.jpg",
      "quantity": 2,
      "unitPrice": 49900.00,
      "lineTotal": 99800.00,
      "productAvailable": true,
      "productStock": 148,
      "addedAt": "2026-04-29T10:05:00"
    }
  ],
  "summary": {
    "itemsCount": 3,
    "subtotal": 149700.00,
    "tax": 28443.00,
    "shipping": 10000.00,
    "total": 188143.00
  }
}
```

---

## 3.5 Orders

> Requiere `Authorization: Bearer <sessionToken>` de usuario autenticado.

### POST `/api/v1/orders/checkout`
- **Auth:** Bearer sessionToken autenticado
- **Body esperado:**

```json
{
  "cartId": 7,
  "shippingAddressId": 1,
  "billingAddressId": 2
}
```

- **Respuesta esperada:** `201 Created`
- **Respuesta:** `OrderResponse`

### GET `/api/v1/orders/me`
- **Auth:** Bearer sessionToken autenticado
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** lista de `OrderResponse`

### GET `/api/v1/orders/{id}`
- **Auth:** Bearer sessionToken autenticado
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `OrderResponse`

### Estructura esperada de `OrderResponse`
```json
{
  "id": 10,
  "orderNumber": "ORD-20260429-00010",
  "userId": 1,
  "userEmail": "juan@example.com",
  "userFullName": "Juan Pérez",
  "status": "PENDING",
  "shippingAddress": {
    "id": 1,
    "userId": 1,
    "type": "SHIPPING",
    "line1": "Cra 49 # 7 Sur - 50",
    "line2": "Apto 301, Torre A",
    "city": "Medellín",
    "state": "Antioquia",
    "country": "Colombia",
    "postalCode": "050021",
    "isDefault": true
  },
  "billingAddress": {
    "id": 2,
    "userId": 1,
    "type": "BILLING",
    "line1": "Cra 49 # 7 Sur - 50",
    "line2": null,
    "city": "Medellín",
    "state": "Antioquia",
    "country": "Colombia",
    "postalCode": "050021",
    "isDefault": false
  },
  "items": [
    {
      "id": 301,
      "productId": 5,
      "sku": "PROD-001-AZL",
      "productName": "Camiseta Azul Talla M",
      "image": "https://cdn.example.com/img/camiseta-azul.jpg",
      "quantity": 2,
      "unitPrice": 49900.00,
      "lineTotal": 99800.00
    }
  ],
  "totals": {
    "subtotal": 99800.00,
    "tax": 18962.00,
    "shipping": 10000.00,
    "total": 128762.00
  },
  "createdAt": "2026-04-29T11:00:00"
}
```

---

## 3.6 User Profile

> Requiere `Authorization: Bearer <sessionToken>` de usuario autenticado.

### PUT `/api/v1/users/me`
- **Auth:** Bearer sessionToken autenticado
- **Body esperado:**

```json
{
  "firstName": "Carlos",
  "lastName": "Ramírez",
  "phone": "+57 314 987 6543"
}
```

- **Respuesta esperada:** `200 OK`
- **Respuesta:** `UserResponse`

### PUT `/api/v1/users/me/password`
- **Auth:** Bearer sessionToken autenticado
- **Body esperado:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecure99!"
}
```

- **Respuesta esperada:** `204 No Content`

### Estructura esperada de `UserResponse`
```json
{
  "id": 1,
  "email": "lgoenaga@cesde.net",
  "firstName": "Juan",
  "lastName": "Pérez",
  "fullName": "Juan Pérez",
  "role": "CUSTOMER",
  "phone": "+57 300 123 4567",
  "status": "ACTIVE",
  "createdAt": "2026-04-29T10:30:00"
}
```

---

## 3.7 Addresses

> Requiere `Authorization: Bearer <sessionToken>` de usuario autenticado.

### GET `/api/v1/users/me/addresses`
- **Auth:** Bearer sessionToken autenticado
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** lista de `AddressResponse`

### GET `/api/v1/users/me/addresses/{id}`
- **Auth:** Bearer sessionToken autenticado
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `AddressResponse`

### POST `/api/v1/users/me/addresses`
- **Auth:** Bearer sessionToken autenticado
- **Body esperado:**

```json
{
  "type": "SHIPPING",
  "line1": "Cra 49 # 7 Sur - 50",
  "line2": "Apto 301, Torre A",
  "city": "Medellín",
  "state": "Antioquia",
  "country": "Colombia",
  "postalCode": "050021",
  "isDefault": true
}
```

- **Respuesta esperada:** `201 Created`
- **Respuesta:** `AddressResponse`

### PUT `/api/v1/users/me/addresses/{id}`
- **Auth:** Bearer sessionToken autenticado
- **Path params:** `id`
- **Body esperado:** mismo esquema de `AddressUpsertRequest`
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `AddressResponse`

### PATCH `/api/v1/users/me/addresses/{id}/default`
- **Auth:** Bearer sessionToken autenticado
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `AddressResponse`

### DELETE `/api/v1/users/me/addresses/{id}`
- **Auth:** Bearer sessionToken autenticado
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `204 No Content`

### Estructura esperada de `AddressResponse`
```json
{
  "id": 1,
  "userId": 1,
  "type": "SHIPPING",
  "line1": "Cra 49 # 7 Sur - 50",
  "line2": "Apto 301, Torre A",
  "city": "Medellín",
  "state": "Antioquia",
  "country": "Colombia",
  "postalCode": "050021",
  "isDefault": true
}
```

---

## 3.8 Admin Users

> Requiere `Authorization: Bearer <sessionToken>` y rol `ADMIN`.

### POST `/api/v1/admin/users`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Body esperado:**

```json
{
  "email": "nuevo@example.com",
  "password": "TempPass123!",
  "firstName": "Luis",
  "lastName": "Pérez",
  "phone": "+57 320 111 2233",
  "role": "CUSTOMER",
  "status": "ACTIVE"
}
```

- **Respuesta esperada:** `201 Created`
- **Respuesta:** `UserResponse`

### GET `/api/v1/admin/users`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** lista de `UserResponse`

### GET `/api/v1/admin/users/{id}`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `UserResponse`

### PUT `/api/v1/admin/users/{id}`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Path params:** `id`
- **Body esperado:**

```json
{
  "email": "actualizado@example.com",
  "firstName": "Ana",
  "lastName": "López",
  "phone": "+57 310 555 7788",
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

- **Respuesta esperada:** `200 OK`
- **Respuesta:** `UserResponse`

### DELETE `/api/v1/admin/users/{id}`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `204 No Content`

---

## 3.9 Admin Products

> Requiere `Authorization: Bearer <sessionToken>` y rol `ADMIN`.

### POST `/api/v1/admin/products`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Body esperado:**

```json
{
  "categoryId": 3,
  "sku": "PROD-001-AZL",
  "name": "Camiseta Azul Talla M",
  "description": "Camiseta 100% algodón, color azul marino",
  "image": "https://cdn.example.com/img/camiseta-azul.jpg",
  "price": 49900.00,
  "stockQty": 150,
  "isActive": true
}
```

- **Respuesta esperada:** `201 Created`
- **Respuesta:** `ProductResponse`

### PUT `/api/v1/admin/products/{id}`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Path params:** `id`
- **Body esperado:** mismo esquema de `ProductUpsertRequest`
- **Respuesta esperada:** `200 OK`
- **Respuesta:** `ProductResponse`

### DELETE `/api/v1/admin/products/{id}`
- **Auth:** Bearer sessionToken + rol ADMIN
- **Path params:** `id`
- **Body:** sin body
- **Respuesta esperada:** `204 No Content`

---

# 4. Resumen ejecutivo para frontend

## Públicos
- `POST /api/v1/auth/guest-session`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/categories`
- `GET /api/v1/categories/tree`
- `GET /api/v1/categories/{id}`
- `GET /api/v1/categories/{id}/subcategories`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`

## Requieren Bearer token
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- todos los endpoints de `cart`
- todos los endpoints de `orders`
- todos los endpoints de `users/me`
- todos los endpoints de `users/me/addresses`

## Requieren Bearer token + ADMIN
- todos los endpoints de `admin/users`
- todos los endpoints de `admin/products`

---

# 5. Nota de versionado

Este archivo se guarda en `docs/`.
En este proyecto, `docs/` ya está ignorado por Git en `.gitignore`, por lo que **no queda versionado** por defecto.

