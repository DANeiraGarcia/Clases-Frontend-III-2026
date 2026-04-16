import styles from '../components/styles/OrderCard.module.css';
import { formatCOP } from '../utils/formatCOP';

function OrderCard({ order, onOpen }) {
  const formattedDate = new Date(order.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.orderId}>{order.id}</p>
          <h3 className={styles.title}>{order.customer.fullName || 'Cliente registrado'}</h3>
          <p className={styles.meta}>{formattedDate}</p>
        </div>
        <span className={styles.total}>{formatCOP(order.totals.total)}</span>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Items</span>
          <strong>{totalItems}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Envio</span>
          <strong>{order.shippingMethod.label}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Pago</span>
          <strong>{order.paymentMethod.label}</strong>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => onOpen(order.id)}>
          Ver detalle
        </button>
      </div>
    </article>
  );
}

export default OrderCard;