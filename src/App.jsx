import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import Cart from './pages/Cart';
import CategoryProducts from './pages/CategoryProducts';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './pages/OrderDetail';
import ProductList from './pages/ProductList';
import Register from './pages/Register';
import UserOrders from './pages/UserOrders';
import UserProfile from './pages/UserProfile';
import {
  calculateOrderTotals,
  getPaymentMethodById,
  getShippingOptionById,
} from './utils/calculateOrderTotals';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';
import { saveOrder } from './utils/ordersStorage';

import './App.css';

function App() {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    if (!product || !Number.isFinite(Number(product.id))) {
      return;
    }

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

      return currentItems.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          stock,
          quantity: Math.min(item.quantity + 1, stock),
        };
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
          <Route path="/products" element={<ProductList />} />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartItemQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
              />
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
                <UserProfile />
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
