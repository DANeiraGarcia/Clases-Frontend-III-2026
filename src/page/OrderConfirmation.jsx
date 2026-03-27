import styles from '../styles/OrderConfirmation.module.css';
import { formatCOP } from '../utils/formatCOP';

function OrderConfirmation({ order, onBackHome }) {
  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>No hay una orden reciente</h1>
          <p className={styles.subtitle}>
            El checkout ya se cerró o no existe una compra para mostrar en esta vista.
          </p>
          <button type="button" className={styles.primaryButton} onClick={onBackHome}>
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className={styles.container}>
      /* resumen de la orden */
    </section>
  );
}

export default OrderConfirmation;