import styles from '../page/OrderConfirmation.module.css';
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
      <div className={styles.card}>

        <div className={styles.successIcon}>✅</div>
        <h1 className={styles.title}>¡Pedido confirmado!</h1>
        <p className={styles.subtitle}>
          Gracias {order.customer.fullName}, tu pedido fue recibido exitosamente.
        </p>

        <div className={styles.meta}>
          <span className={styles.orderId}>Orden: {order.id}</span>
          <span className={styles.orderDate}>{formattedDate}</span>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Productos</h2>
          {order.items.map((item) => (
            <div key={item.id} className={styles.item}>
              <img className={styles.itemImage} src={item.image} alt={item.name} />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemQty}>x{item.quantity}</span>
              </div>
              <span className={styles.itemPrice}>{formatCOP(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Resumen de pago</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCOP(order.totals.subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Envío</span>
            <span>{order.totals.shipping === 0 ? 'Gratis' : formatCOP(order.totals.shipping)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Impuestos</span>
            <span>{formatCOP(order.totals.tax)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span>{formatCOP(order.totals.total)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Datos de entrega</h2>
          <p className={styles.infoText}>{order.customer.address}, {order.customer.city}</p>
          <p className={styles.infoText}>Código postal: {order.customer.postalCode}</p>
          <p className={styles.infoText}>Contacto: {order.customer.phone}</p>
          <p className={styles.infoText}>Correo: {order.customer.email}</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Método de envío y pago</h2>
          <p className={styles.infoText}>Envío: {order.shippingMethod?.label}</p>
          <p className={styles.infoText}>Pago: {order.paymentMethod?.label}</p>
        </div>

        <button type="button" className={styles.primaryButton} onClick={onBackHome}>
          Volver al inicio
        </button>
      </div>
    </section>
  );
}

export default OrderConfirmation;