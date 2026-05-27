import { useEffect, useMemo,useRef, useState } from 'react';
import { useNavigate, Navigate, Route, Routes } from 'react-router-dom';

import axiosClient from './lib/axiosClient';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Checkout from './page/Checkout';
import Home from './page/Home';
import Login from './page/Login';
import OrderConfirmation from './page/OrderConfirmation';
import OrderDetail from './page/OrderDetail';
import ProductList from './page/ProductList';
import Register from './page/Register';
import UserOrders from './page/UserOrders';
import UserProfile from './page/UserProfile';
import {
  calculateOrderTotals,
  getPaymentMethodById,
  getShippingOptionById,
} from './utils/calculateOrderTotals';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';
import { saveOrder } from './utils/ordersStorage';

import './App.css';

function App() {
  const { currentUser, logout } = useAuth();
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [latestOrder, setLatestOrder] = useState(null);
  const localItemsBeforeLogin = useRef([]);
  const navigate = useNavigate();

// 1. Captura items locales SIEMPRE que cambien, mientras no hay sesión
useEffect(() => {
  if (!currentUser) {
    localItemsBeforeLogin.current = [...cartItems];
  }
}, [cartItems, currentUser]);

// 2. Merge cuando el usuario se loguea
useEffect(() => {
  if (!currentUser) return;

  const mergeAndLoad = async () => {
    const localItems = localItemsBeforeLogin.current;

    if (localItems.length > 0) {
      for (const item of localItems) {
        try {
          await axiosClient.post('/cart/items', {
            productId: item.id,
            quantity: item.quantity,
          });
        } catch {
          // si un item falla, continúa
        }
      }
      localItemsBeforeLogin.current = []; // limpiar después del merge
    }

    try {
      const res = await axiosClient.get('/cart/me');
      if (Array.isArray(res.data.items)) {
        const mappedItems = res.data.items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: item.unitPrice,
          stock: item.productStock,
          image: item.image,
          quantity: item.quantity,
        }));
        setCartItems(mappedItems);
      }
    } catch {}
  };

  mergeAndLoad();
}, [currentUser]);

  const handleAddToCart = async (product) => {
    console.log('producto recibido:', product);
  if (!product) {
    return;
  }

  if (currentUser) {
    try {
      await axiosClient.post('/cart/items', {  // ← falta este POST
        productId: product.id,
        quantity: 1,
      });
      const res = await axiosClient.get('/cart/me');
      if (Array.isArray(res.data.items)) {
        const mappedItems = res.data.items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: item.unitPrice,
          stock: item.productStock,
          image: item.image,
          quantity: item.quantity,
        }));
        setCartItems(mappedItems);
      }
    } catch (err) {
  console.error('error al agregar:', err.response?.data);
}
    return;
  }

  // lógica local para invitados
  setCartItems((currentItems) => {
    const existingItem = currentItems.find((item) => item.id === product.id);
    const stock = Number.isFinite(Number(product.stock)) && Number(product.stock) > 0
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

    return currentItems.map((item) => {
      if (item.id !== product.id) return item;
      return { ...item, stock, quantity: Math.min(item.quantity + 1, stock) };
    });
  });
};

  const handleUpdateCartItemQuantity = (productId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        const stock =
          Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : 1;
        const normalizedQuantity = Math.max(
          1,
          Math.min(stock, Math.floor(Number(nextQuantity) || 1))
        );

        return normalizedQuantity > 0 ? [{ ...item, quantity: normalizedQuantity }] : [];
      })
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCompleteCheckout = ({ customer, shippingMethodId, paymentMethodId }) => {
    if (cartItems.length === 0) {
      return null;
    }

    const totals = calculateOrderTotals(cartItems, shippingMethodId);
    const order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser?.id ?? '',
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
    return order;
  };

  const handleBackHomeAfterOrder = () => {
    setLatestOrder(null);
  };

  const handleSignOut = () => {
  logout();
  navigate('/login');
};

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="app">
      <Header user={currentUser} cartItemCount={cartItemCount} />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryProducts cartItems={cartItems} onAddToCart={handleAddToCart} />}
          />
          <Route path="/products" 
          element={
            //<ProtectedRoute>
            <ProductList />
            //</ProtectedRoute>
          } 
            />

          <Route
            path="/cart"
            element={
               //<ProtectedRoute>
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartItemQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onContinueShopping={() => navigate('/')}
              />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout
                  cartItems={cartItems}
                  user={currentUser}
                  onCompleteCheckout={handleCompleteCheckout}
                  onOrderComplete={handleClearCart}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <OrderConfirmation order={latestOrder} onBackHome={handleBackHomeAfterOrder} />
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserProfile user={currentUser} onSignOut={handleSignOut} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/orders"
            element={
              <ProtectedRoute>
                <UserOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
