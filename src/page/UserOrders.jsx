import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axiosClient from '../lib/axiosClient';
import OrderCard from '../components/OrderCard';
import useAuth from '../hooks/useAuth';
import styles from '../page/styles/UserOrders.module.css';
import { loadOrdersByUserId } from '../utils/ordersStorage';
import { formatCOP } from '../utils/formatCOP';

function UserOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    axiosClient
      .get('/orders/me')
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        // Si falla, usa los órdenes locales como fallback
        setOrders(loadOrdersByUserId(currentUser?.id));
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);
  const latestOrder = orders[0] ?? null;

  const profile = {
    name: currentUser?.name || 'Invitado',
    email: currentUser?.email || 'Sin correo registrado',
    phone: currentUser?.phone || latestOrder?.customer?.phone || 'Sin telefono registrado',
    address:
      currentUser?.address || latestOrder?.customer?.address || 'Aun no hay direccion registrada',
    city: currentUser?.city || latestOrder?.customer?.city || 'Sin ciudad registrada',
    postalCode: currentUser?.postalCode || latestOrder?.customer?.postalCode || '---',
  };

  const stats = {
    totalOrders: orders.length,
    latestOrderId: latestOrder?.id ?? 'Sin compras',
    latestTotal: latestOrder ? formatCOP(latestOrder.totals.total) : 'Sin compras',
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mi cuenta</h1>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Ver historial
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Datos del perfil</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nombre</span>
              <strong>{profile.name}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Correo</span>
              <strong>{profile.email}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Telefono</span>
              <strong>{profile.phone}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Direccion</span>
              <strong>{profile.address}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Ciudad</span>
              <strong>{profile.city}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Codigo postal</span>
              <strong>{profile.postalCode}</strong>
            </div>
          </div>
        </section>

        <aside className={styles.card}>
          <h2 className={styles.sectionTitle}>Resumen de compras</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.label}>Ordenes guardadas</span>
              <strong>{stats.totalOrders}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Ultima orden</span>
              <strong>{stats.latestOrderId}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Ultimo total</span>
              <strong>{stats.latestTotal}</strong>
            </div>
          </div>

          {latestOrder ? (
            <div className={styles.latestOrder}>
              <p className={styles.latestOrderText}>
                Tu compra mas reciente fue enviada con{' '}
                <strong>{latestOrder.shippingMethod.label}</strong> y pagada con{' '}
                <strong>{latestOrder.paymentMethod.label}</strong>.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(`/user/orders/${latestOrder.id}`)}
              >
                Abrir ultima orden
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                Aun no hay compras registradas. Cuando completes el checkout, el historial quedara
                disponible desde esta seccion.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default UserOrders;
