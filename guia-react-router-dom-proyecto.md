# Guía completa (estudiantes) — React Router DOM en `frontend-sistema-ventas`

Esta guía explica **cómo se usa `react-router-dom` en este proyecto real** y, sobre todo, **por qué se usa cada pieza en cada lugar**.

> Objetivo: que entiendas qué problema resuelve el router, cómo se organiza la navegación de una SPA y cuál es la diferencia práctica entre `Navigate`, `NavLink` y `useNavigate` dentro de este proyecto.

---

## 1) ¿Qué problema resuelve `react-router-dom`?

Sin router, una aplicación React tendría que cambiar pantallas con estado local o recargar páginas completas del navegador.

En este proyecto, `react-router-dom` permite:

1. Tener URLs reales como `/products`, `/cart`, `/checkout` o `/user/profile`.
2. Navegar sin recargar toda la página.
3. Proteger rutas según autenticación o rol.
4. Leer parámetros de la URL, por ejemplo una categoría o el id de una orden.
5. Mantener una experiencia más parecida a una aplicación real.

En otras palabras: `react-router-dom` convierte esta app en una **SPA** con navegación basada en rutas.

---

## 2) Mapa mental rápido: declarativo vs imperativo

Antes de ir archivo por archivo, necesitas una idea clave.

### Navegación declarativa

La navegación declarativa significa:

"si se cumple esta condición, React debe renderizar otra ruta o un link hacia otra ruta".

Aquí entran principalmente:

1. `Route`
2. `Navigate`
3. `NavLink`

### Navegación imperativa

La navegación imperativa significa:

"cuando ocurra este evento, lleva al usuario a otra ruta".

Aquí entra principalmente:

1. `useNavigate`

Regla práctica inicial:

1. Si quieres **mostrar un link visible** en la interfaz, piensa primero en `NavLink`.
2. Si quieres **redirigir automáticamente** por una condición, piensa primero en `Navigate`.
3. Si quieres **navegar después de un click, submit o lógica**, piensa primero en `useNavigate`.

---

## 3) ¿Dónde empieza el router en este proyecto?

Archivo clave: `frontend-sistema-ventas/src/main.jsx`

Allí aparece esto:

```jsx
<AuthProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</AuthProvider>
```

### ¿Qué hace `BrowserRouter`?

`BrowserRouter` activa el sistema de rutas en toda la aplicación.

Sin `BrowserRouter`:

1. `Route` no funcionaría.
2. `NavLink` no sabría a qué URL ir.
3. `useNavigate`, `useLocation` y `useParams` fallarían.

### ¿Por qué se usa aquí?

Porque `main.jsx` es el punto de entrada de toda la app. Si el router envuelve a `App`, entonces todas las páginas y componentes hijos pueden usar la navegación.

Idea para estudiante:

`BrowserRouter` no navega por sí solo; lo que hace es **activar el contexto del router** para que el resto de herramientas funcionen.

---

## 4) ¿Dónde está definido el mapa de rutas?

Archivo clave: `frontend-sistema-ventas/src/App.jsx`

Allí aparece el bloque central con:

1. `Routes`
2. `Route`
3. la ruta comodín con `Navigate`

Ejemplo simplificado:

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/products" element={<ProductList />} />
  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### ¿Qué hace `Routes`?

`Routes` es el contenedor que revisa la URL actual y decide qué `Route` coincide.

### ¿Qué hace `Route`?

Cada `Route` dice:

"si la URL es esta, renderiza este componente".

Por eso en `App.jsx` el estudiante puede ver el mapa general de la aplicación:

### Rutas públicas

1. `/`
2. `/login`
3. `/register`
4. `/products`
5. `/category/:categoryName`
6. `/cart`
7. `/order-confirmation`

### Rutas protegidas

1. `/checkout`
2. `/user/profile`
3. `/user/orders`
4. `/user/orders/:orderId`

### Rutas admin

1. `/admin`
2. `/admin/products`

### ¿Por qué esto es didácticamente importante?

Porque `App.jsx` muestra una idea muy valiosa:

**el router no es solo navegación; también es estructura de acceso**.

No solo decide qué página abrir, sino quién puede abrirla.

---

## 5) `Navigate`: qué es, dónde se usa y por qué

`Navigate` sirve para **redirigir automáticamente** durante el render.

No se usa por un click manual del usuario. Se usa cuando el componente decide:

"esta persona no debería quedarse aquí, la envío a otra ruta".

### 5.1 Uso en la ruta comodín

Archivo: `src/App.jsx`

```jsx
<Route path="*" element={<Navigate to="/" replace />} />
```

### ¿Qué significa?

Si el usuario escribe una ruta que no existe, la app lo redirige al inicio.

### ¿Por qué `Navigate` aquí?

Porque no hay un botón ni un evento. La redirección ocurre **solo por condición de ruta no encontrada**.

---

### 5.2 Uso en `ProtectedRoute`

Archivo: `src/components/ProtectedRoute.jsx`

```jsx
if (!isAuthenticated) {
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
```

### ¿Qué hace?

Si el usuario no está autenticado y trata de entrar a una ruta protegida, la app lo envía al login.

### ¿Por qué `Navigate` aquí?

Porque la redirección depende de una condición de acceso, no de un click.

### ¿Qué hace `replace`?

Evita dejar en el historial la página bloqueada como paso anterior inmediato. Esto ayuda a que el botón "atrás" no genere una experiencia rara.

### ¿Qué hace `state={{ from: location.pathname }}`?

Guarda la ruta original que el usuario intentó abrir.

Ejemplo:

1. usuario intenta entrar a `/checkout`
2. `ProtectedRoute` detecta que no ha iniciado sesión
3. `Navigate` lo manda a `/login`
4. además guarda `from: '/checkout'`

Esto después permite devolverlo a donde quería ir.

---

### 5.3 Uso en `AdminRoute`

Archivo: `src/components/AdminRoute.jsx`

Hay dos redirecciones distintas:

```jsx
if (!isAuthenticated) {
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

if (!isAdmin) {
  return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />;
}
```

### ¿Por qué aquí hay dos casos?

Porque este componente separa dos problemas:

1. autenticación: no ha iniciado sesión
2. autorización: sí inició sesión, pero no tiene permisos de admin

### ¿Por qué `Navigate` sigue siendo la herramienta correcta?

Porque de nuevo se trata de **redirección automática por condición**, no de navegación iniciada por el usuario.

---

### 5.4 Regla práctica de `Navigate`

Usa `Navigate` cuando:

1. quieres redirigir por una condición de render
2. no hay un botón que dispare la navegación
3. la app decide que la ruta actual no debe seguir mostrándose

No es la mejor opción cuando:

1. el usuario hace click en un botón
2. la navegación ocurre al terminar un submit
3. quieres navegar desde una función manejadora de evento

En esos casos, normalmente conviene `useNavigate`.

---

## 6) `NavLink`: qué es, dónde se usa y por qué

`NavLink` sirve para crear **links visibles de navegación** y además saber si ese link está activo.

En este proyecto se usa sobre todo en:

Archivo: `src/components/Navbar.jsx`

Ejemplos reales:

```jsx
<NavLink to="/" end className={() => `${styles.link} ${isHomeActive ? styles.active : ''}`}>
  Inicio
</NavLink>

<NavLink
  to="/products"
  className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
>
  Productos
</NavLink>
```

### ¿Qué resuelve `NavLink` mejor que un botón o un link simple?

1. crea navegación visible en la interfaz
2. sabe cuándo la ruta está activa
3. permite pintar estilos de activo automáticamente o con lógica personalizada

### ¿Por qué no usar `useNavigate` para todo el navbar?

Porque el navbar es navegación estructural visible. Para eso es mejor un link declarativo.

Si usas `NavLink`:

1. el JSX expresa que eso es un enlace de navegación
2. el código es más semántico
3. el estado activo es más natural de manejar

---

### 6.1 Caso simple: `Productos`

```jsx
<NavLink
  to="/products"
  className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
>
  Productos
</NavLink>
```

Este es el caso más directo.

### ¿Por qué funciona bien?

Porque `Productos` está activo cuando la URL actual es `/products`.

No necesita lógica extra.

---

### 6.2 Caso con `end`: `Inicio`

```jsx
<NavLink to="/" end ...>
  Inicio
</NavLink>
```

### ¿Por qué se usa `end`?

Porque la ruta `/` es prefijo de muchas rutas. Sin `end`, el enlace de inicio podría comportarse como activo en más páginas de las deseadas.

### ¿Qué enseña esto al estudiante?

Que un link al root `/` necesita cuidado especial para no quedar activo casi siempre.

---

### 6.3 Caso con lógica personalizada: `Carrito`

En `Navbar.jsx` aparece esta idea:

```jsx
const isCartActive =
  location.pathname === '/cart' ||
  location.pathname === '/checkout' ||
  location.pathname === '/order-confirmation';
```

Y luego:

```jsx
<NavLink to="/cart" className={() => `${styles.link} ${isCartActive ? styles.active : ''}`}>
  Carrito
</NavLink>
```

### ¿Por qué no usar solamente `isActive`?

Porque pedagógicamente aquí el proyecto quiere que `Carrito` se vea activo no solo en `/cart`, sino también en rutas relacionadas del flujo de compra:

1. `/checkout`
2. `/order-confirmation`

Es decir, el enlace representa una **sección completa del flujo**, no una sola URL exacta.

### ¿Qué aprende el estudiante aquí?

Que `NavLink` resuelve la mayoría de los casos, pero a veces conviene combinarlo con `useLocation` para crear una definición de activo más amplia.

---

### 6.4 Regla práctica de `NavLink`

Usa `NavLink` cuando:

1. el usuario debe ver un link de navegación
2. quieres mostrar estado activo
3. ese elemento forma parte del menú o navegación estructural

No es la mejor opción cuando:

1. la navegación ocurre después de un submit
2. necesitas navegar dentro de un handler complejo
3. el elemento no es realmente un link visible sino una acción con lógica condicional

En esos casos conviene `useNavigate`.

---

## 7) `useNavigate`: qué es, dónde se usa y por qué

`useNavigate` es un hook que devuelve una función para navegar desde JavaScript.

Ejemplo básico:

```jsx
const navigate = useNavigate();
navigate('/cart');
```

### Idea central

`useNavigate` se usa cuando la navegación pasa por una acción o una lógica.

No es un link visible; es una orden imperativa.

---

### 7.1 En `Home.jsx`

Archivo: `src/pages/Home.jsx`

```jsx
onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
```

### ¿Por qué aquí se usa `useNavigate`?

Porque la navegación ocurre cuando el usuario hace click en una tarjeta-botón de categoría.

No es un menú clásico, sino una acción basada en un valor dinámico.

Además, aquí se enseña otra idea importante:

### ¿Por qué `encodeURIComponent(category)`?

Porque el nombre de categoría viaja en la URL. Si tuviera espacios o caracteres especiales, conviene codificarlo correctamente.

---

### 7.2 En `Checkout.jsx`

Archivo: `src/pages/Checkout.jsx`

Después del submit:

```jsx
if (order) {
  navigate('/order-confirmation');
} else {
  navigate('/cart');
}
```

### ¿Por qué `useNavigate` aquí?

Porque la ruta destino depende del resultado de una operación asíncrona.

Es decir:

1. se ejecuta lógica
2. se espera resultado
3. según el resultado, se navega

Ese patrón no lo resuelve un `NavLink` ni un `Navigate` estático.

---

### 7.3 En `Login.jsx`

Archivo: `src/pages/Login.jsx`

```jsx
const nextPath = location.state?.from || '/user/profile';
navigate(nextPath, { replace: true });
```

Este es uno de los mejores ejemplos didácticos del proyecto.

### Flujo completo

1. el usuario intenta abrir `/checkout`
2. `ProtectedRoute` detecta que no está autenticado
3. `Navigate` lo manda a `/login` y guarda `from: '/checkout'`
4. el usuario hace login correctamente
5. `Login.jsx` lee `location.state?.from`
6. `useNavigate` lo devuelve a `/checkout`

### ¿Por qué aquí no se usa `Navigate`?

Porque la redirección ocurre después de un evento y un resultado de login.

Es una decisión tomada dentro de una función, no directamente en el render.

---

### 7.4 En `Navbar.jsx`

Archivo: `src/components/Navbar.jsx`

Ejemplos:

```jsx
navigate(isLoggedIn ? '/user/profile' : '/login');
navigate('/', { replace: true });
```

### ¿Por qué aquí se usa `useNavigate` si también existe `NavLink`?

Porque esos botones no son enlaces simples.

Tienen lógica:

1. `Mi cuenta` depende de si hay sesión o no
2. `Salir` hace logout y luego navega
3. `Admin` aparece según rol
4. `Ingresar` y `Registrarse` salen desde botones con intención de acción

Aquí el proyecto enseña bien la diferencia:

1. `NavLink` para menú visible y directo
2. `useNavigate` para acciones con lógica previa

---

### 7.5 En `OrderDetail.jsx`

Archivo: `src/pages/OrderDetail.jsx`

Se usa para botones como:

1. volver al historial
2. ir al inicio
3. ir al perfil

### ¿Por qué `useNavigate` aquí?

Porque esos botones representan acciones de salida o cambio de contexto, no un menú permanente.

Además, la página también usa `useParams`, así que este archivo es muy bueno para mostrar que se pueden combinar varios hooks del router en la misma pantalla.

---

### 7.6 Regla práctica de `useNavigate`

Usa `useNavigate` cuando:

1. la navegación ocurre después de un click en botón
2. la navegación depende de una condición
3. la navegación ocurre después de un submit o una promesa
4. necesitas opciones como `replace`
5. la ruta se construye dinámicamente desde datos o parámetros

No es la mejor opción cuando:

1. solo quieres mostrar un link de menú
2. quieres aprovechar automáticamente el estado activo de un link visible

En esos casos suele ser mejor `NavLink`.

---

## 8) `useLocation`: por qué aparece tanto en este proyecto

`useLocation` permite leer información de la ruta actual.

En este proyecto se usa especialmente para dos cosas:

1. saber desde qué ruta fue redirigido el usuario
2. construir estados activos personalizados en el navbar

### 8.1 En guards

En `ProtectedRoute.jsx` y `AdminRoute.jsx` se usa para guardar:

```jsx
state={{ from: location.pathname }}
```

### ¿Para qué sirve?

Para recordar la ruta original.

---

### 8.2 En `Login.jsx`

Se usa para recuperar ese valor:

```jsx
const nextPath = location.state?.from || '/user/profile';
```

Esto completa el patrón de retorno al origen.

---

### 8.3 En `Navbar.jsx`

Se usa para calcular estados activos más ricos que el simple `isActive` del `NavLink`.

Por ejemplo:

1. considerar `/category/...` como parte de Inicio
2. considerar `/checkout` como parte de Carrito
3. considerar `/login` y `/register` como parte de Mi cuenta

### Idea pedagógica

`useLocation` no navega. Lo que hace es **decirte dónde estás**.

---

## 9) `useParams`: por qué es importante

`useParams` sirve para leer parámetros definidos en la ruta.

### 9.1 En `CategoryProducts.jsx`

Archivo: `src/pages/CategoryProducts.jsx`

Ruta en `App.jsx`:

```jsx
<Route path="/category/:categoryName" ... />
```

Lectura del parámetro:

```jsx
const { categoryName } = useParams();
```

Y luego:

```jsx
const category = useMemo(
  () => (categoryName ? decodeURIComponent(categoryName) : null),
  [categoryName]
);
```

### ¿Qué enseña este caso?

1. cómo definir un parámetro en `Route`
2. cómo leerlo con `useParams`
3. cómo decodificarlo si fue enviado codificado en la URL
4. cómo usar ese valor para filtrar contenido

---

### 9.2 En `OrderDetail.jsx`

Ruta en `App.jsx`:

```jsx
<Route path="/user/orders/:orderId" ... />
```

Lectura del parámetro:

```jsx
const { orderId } = useParams();
```

Después se usa para cargar la orden correcta en un `useEffect`.

### ¿Qué aprende el estudiante aquí?

Que el parámetro no es la data final, sino una pista para buscar la data correcta.

---

## 10) Flujo completo más importante del proyecto

Este flujo es probablemente el mejor para entender varias piezas del router juntas.

### Caso: entrar a una ruta protegida sin login

1. usuario intenta abrir `/checkout`
2. `App.jsx` envuelve esa ruta con `ProtectedRoute`
3. `ProtectedRoute` verifica sesión
4. si no hay sesión, retorna:

```jsx
<Navigate to="/login" replace state={{ from: location.pathname }} />
```

5. `Login.jsx` recibe esa navegación
6. el usuario inicia sesión
7. `Login.jsx` hace:

```jsx
const nextPath = location.state?.from || '/user/profile';
navigate(nextPath, { replace: true });
```

8. el usuario termina en la ruta original que intentaba abrir

### ¿Qué piezas participaron?

1. `Route`
2. `ProtectedRoute`
3. `Navigate`
4. `useLocation`
5. `useNavigate`

### ¿Por qué este flujo es tan importante?

Porque muestra que `react-router-dom` no solo cambia pantallas. También coordina:

1. acceso
2. memoria de origen
3. retorno inteligente
4. experiencia de usuario más realista

---

## 11) Diferencias directas: `Navigate` vs `NavLink` vs `useNavigate`

### `Navigate`

Piensa en esta pregunta:

"¿Necesito redirigir automáticamente porque una condición no permite quedarse en esta ruta?"

Si la respuesta es sí, piensa primero en `Navigate`.

En este proyecto se usa para:

1. proteger rutas
2. redirigir accesos no autorizados
3. enviar rutas no válidas al inicio

---

### `NavLink`

Piensa en esta pregunta:

"¿Necesito mostrar un enlace visible en la navegación y saber si está activo?"

Si la respuesta es sí, piensa primero en `NavLink`.

En este proyecto se usa para:

1. Inicio
2. Productos
3. Carrito

Y se combina con lógica personalizada para estados activos más amplios.

---

### `useNavigate`

Piensa en esta pregunta:

"¿Necesito navegar desde una función después de una acción, un click o una lógica?"

Si la respuesta es sí, piensa primero en `useNavigate`.

En este proyecto se usa para:

1. login
2. logout
3. checkout
4. botones de volver
5. entrar a categorías
6. ir a detalle de órdenes
7. navegación condicional según rol o sesión

---

## 12) Tabla rápida de decisión

### Si quieres esto... ¿qué usas?

1. Mostrar un link del menú principal
   Usa `NavLink`

2. Redirigir automáticamente porque el usuario no cumple una condición
   Usa `Navigate`

3. Navegar después de un submit exitoso
   Usa `useNavigate`

4. Llevar al usuario a otra ruta después de hacer logout
   Usa `useNavigate`

5. Marcar un item del menú como activo
   Usa `NavLink`, a veces con apoyo de `useLocation`

6. Recuperar la ruta desde la cual fue redirigido
   Usa `useLocation`

7. Leer un parámetro como `orderId` o `categoryName`
   Usa `useParams`

---

## 13) Errores comunes del estudiante

1. Querer usar `useNavigate` para todos los links visibles.
   Problema: se pierde la semántica y el estado activo natural del menú.

2. Querer usar `NavLink` para una redirección automática.
   Problema: `NavLink` es un link visible, no una lógica de guard o acceso.

3. No entender cuándo usar `replace`.
   Problema: el historial del navegador puede quedar raro, sobre todo en login o redirects.

4. Olvidar `encodeURIComponent` y `decodeURIComponent` en rutas con texto.
   Problema: categorías con espacios o caracteres especiales pueden romper la URL.

5. Pensar que `useParams` trae el objeto completo.
   Problema: solo trae el valor de la URL; luego toca usarlo para buscar o cargar la data real.

6. No distinguir navegación declarativa de imperativa.
   Problema: el código termina mezclando links, redirects y handlers sin criterio claro.

---

## 14) Resumen final

En este proyecto, `react-router-dom` no se usa solo para cambiar páginas. Se usa para construir una navegación completa y coherente.

La idea central que debes llevarte es esta:

1. `Route` define qué componente corresponde a cada URL.
2. `Navigate` redirige automáticamente cuando una condición lo exige.
3. `NavLink` crea links visibles con estado activo.
4. `useNavigate` navega desde funciones y eventos.
5. `useLocation` ayuda a saber dónde estás o desde dónde te redirigieron.
6. `useParams` te da datos de la URL para filtrar o cargar contenido.

Si entiendes esas seis piezas dentro de este proyecto, ya no estarás memorizando `react-router-dom`: estarás entendiendo cómo se diseña la navegación de una aplicación React real.