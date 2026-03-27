import { useEffect, useMemo, useState } from 'react';

import Footer from './components/Footer';
import Header from './components/Header';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Home from './page/Home';
import ProductList from './page/ProductList';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';
import {
  calculateOrderTotals,
  getPaymentMethodById,
  getShippingOptionById,
} from './utils/calculateOrderTotals';
import { saveOrder } from './utils/ordersStorage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

import './App.css';


function App() {
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  /* lógica existente del carrito */

  const handleStartCheckout = () => {
    setActivePage('checkout');
  };

  const handleCompleteCheckout = ({ customer, shippingMethodId, paymentMethodId }) => {
    if (cartItems.length === 0) {
      setActivePage('cart');
      return;
    }

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
    setActivePage('order-confirmation');
  };

  const handleBackHomeAfterOrder = () => {
    setLatestOrder(null);
    setSelectedCategory(null);
    setActivePage('home');
  };

  let page = <Home onOpenCategory={handleOpenCategory} />;

  if (activePage === 'category') {
    page = <CategoryProducts /* props */ />;
  } else if (activePage === 'products') {
    page = <ProductList />;
  } else if (activePage === 'cart') {
    page = <Cart /* props */ />;
  } else if (activePage === 'checkout') {
    page = <Checkout /* props */ />;
  } else if (activePage === 'order-confirmation') {
    page = <OrderConfirmation /* props */ />;
  }

  return (
    <div className="app">
      <Header /* props */ />
      <main className="main">{page}</main>
      <Footer />
    </div>
  );
}

export default App;