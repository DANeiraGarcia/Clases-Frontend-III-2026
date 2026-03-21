import { useEffect, useMemo, useState } from 'react';

import Footer from './components/Footer';
import Header from './components/Header';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Home from './page/Home';
import ProductList from './page/ProductList';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState(loadCartItems);

  // guarda el carrito en localStorage cada vez que cambia
  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // agregar producto al carrito
  const handleAddToCart = (product) => {
    if (!product || !Number.isFinite(Number(product.id))) return;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const stock =
        Number.isFinite(Number(product.stock)) && Number(product.stock) > 0
          ? Number(product.stock)
          : 1;

      if (!existingItem) {
        return [
          ...currentItems,
          {
            id: Number(product.id),
            name: product.name,
            category: product.category,
            price: Number(product.price) || 0,
            stock,
            image: product.image,
            quantity: 1,
          },
        ];
      }

      return currentItems.map((item) =>
        item.id !== product.id
          ? item
          : { ...item, stock, quantity: Math.min(item.quantity + 1, stock) }
      );
    });
  };

  // actualizar cantidad
  const handleUpdateCartItemQuantity = (productId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== productId) return [item];
        const stock =
          Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : 1;
        const normalizedQuantity = Math.max(1, Math.min(stock, Math.floor(Number(nextQuantity) || 1)));
        return normalizedQuantity > 0 ? [{ ...item, quantity: normalizedQuantity }] : [];
      })
    );
  };

  // eliminar item
  const handleRemoveCartItem = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  // vaciar carrito
  const handleClearCart = () => {
    setCartItems([]);
  };

  // contador total de unidades
  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const handleSignIn = () => setUser({ name: 'Usuario' });
  const handleSignOut = () => setUser(null);

  return (
    <BrowserRouter>
      <div className="app">
        <Header
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          cartItemCount={cartItemCount}
        />

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/category/:categoryName"
              element={<CategoryProducts cartItems={cartItems} onAddToCart={handleAddToCart} />}
            />
            <Route path="/products" element={<ProductList />} />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateCartItemQuantity}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onContinueShopping={() => window.history.back()}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;