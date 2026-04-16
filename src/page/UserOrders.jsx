import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import OrderCard from '../components/OrderCard';
import useAuth from '../hooks/useAuth';
import styles from '../page/styles/UserOrders.module.css';
import { loadOrders } from '../utils/ordersStorage';
import { formatCOP } from '../utils/formatCOP';


function UserOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orders = useMemo(
    () =>
      loadOrdersByUserId(currentUser?.id).sort(
        (leftOrder, rightOrder) => new Date(rightOrder.createdAt) - new Date(leftOrder.createdAt)
      ),
    [currentUser?.id]
  );

  if (orders.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Mis ordenes</h1>
          <p className={styles.subtitle}>
            Todavía no hay compras asociadas a tu sesión. Completa el checkout autenticado para
            poblar esta vista.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/user/profile')}
            >
              Ir al perfil
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
              Explorar productos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Historial de ordenes</h1>
          <p className={styles.subtitle}>
            Recupera únicamente las compras del usuario autenticado y navega al detalle de cada
            pedido.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Mi perfil
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.list}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOpen={(orderId) => navigate(`/user/orders/${orderId}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default UserOrders;
