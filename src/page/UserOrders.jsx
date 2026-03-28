import { useNavigate } from 'react-router-dom';
import { loadOrders } from '../utils/ordersStorage';
import { formatCOP } from '../utils/formatCOP';
import styles from '../page/UserOrders.module.css';

function UserOrders() {
  const navigate = useNavigate();
  const orders = loadOrders();

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.secondaryButton} onClick={() => navigate('/user/profile')}>
          Volver al perfil
        </button>
        <div>
          <h1 className={styles.title}>Mis órdenes</h1>
          <p className={styles.subtitle}>Historial de todas tus compras.</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No tienes órdenes aún</h2>
          <p className={styles.emptyText}>Realiza tu primera compra para verla aquí.</p>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <article key={order.id} className={styles.orderCard}>
              <div className={styles.orderInfo}>
                <span className={styles.orderId}>{order.id}</span>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleString('es-CO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className={styles.orderMeta}>
                <span className={styles.orderItems}>{order.items.length} producto(s)</span>
                <span className={styles.orderTotal}>{formatCOP(order.totals.total)}</span>
              </div>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate(`/user/orders/${order.id}`)}
              >
                Ver detalle
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default UserOrders;