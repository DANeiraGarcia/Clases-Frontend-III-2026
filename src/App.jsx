import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Home from './page/Home';
import ProductList from './page/ProductList';
import Checkout from './page/Checkout';
import OrderConfirmation from './page/OrderConfirmation';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';
import {
  calculateOrderTotals,
  getPaymentMethodById,
  getShippingOptionById,
} from './utils/calculateOrderTotals';
import { saveOrder } from './utils/ordersStorage';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    if (!product || !Number.isFinite(Number(product.id))) return;
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const stock =
        Number.isFinite(Number(product.stock)) && Number(product.stock) > 0
          ? Number(product.stock) : 1;
      if (!existingItem) {
        return [...currentItems, {
          id: Number(product.id),
          name: product.name,
          category: product.category,
          price: Number(product.price) || 0,
          stock,
          image: product.image,
          quantity: 1,
        }];
      }
      return currentItems.map((item) =>
        item.id !== product.id
          ? item
          : { ...item, stock, quantity: Math.min(item.quantity + 1, stock) }
      );
    });
  };

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

  const handleRemoveCartItem = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => setCartItems([]);

  const handleCompleteCheckout = ({ customer, shippingMethodId, paymentMethodId }) => {
    if (cartItems.length === 0) return;
    const totals = calculateOrderTotals(cartItems, shippingMethodId);
    const order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({ ...item })),
      customer,
      shippingMethod: getShippingOptionById(shippingMethodId),
      paymentMethod: getPaymentMethodById(paymentMethodId),
      totals,
    };
    saveOrder(order);
    setLatestOrder(order);
    setCartItems([]);
  };

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const handleSignIn = () => setUser({ name: 'Usuario' });
  const handleSignOut = () => setUser(null);

  // componente interno pequeño solo para usar useNavigate
  function InnerApp() {
    const navigate = useNavigate();

    return (
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
                  onContinueShopping={() => navigate('/')}
                  onProceedToCheckout={() => navigate('/checkout')}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cartItems={cartItems}
                  user={user}
                  onBack={() => navigate('/cart')}
                  onCompleteCheckout={(data) => {
                    handleCompleteCheckout(data);
                    navigate('/order-confirmation');
                  }}
                />
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <OrderConfirmation
                  order={latestOrder}
                  onBackHome={() => {
                    setLatestOrder(null);
                    navigate('/');
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}

export default App;