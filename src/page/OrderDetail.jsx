import{ useNavigate, useParams } from 'react-router-dom';
import { loadOrders } from '../utils/ordersStorage';
import { formatCOP } from '../utils/formatCOP';
import styles from '../page/styles/OrderDetail.module.css';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = loadOrders().find((o) => o.id === orderId);

  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Orden no encontrada</h1>
          <p className={styles.subtitle}>No existe una orden con ese ID.</p>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/user/orders')}>
            Volver a mis órdenes
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate('/user/orders')}>
            Volver a mis órdenes
          </button>
          <div>
            <h1 className={styles.title}>Detalle de orden</h1>
            <p className={styles.orderId}>{order.id}</p>
          </div>
        </header>

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
          <p className={styles.infoText}>{order.customer.fullName}</p>
          <p className={styles.infoText}>{order.customer.address}, {order.customer.city}</p>
          <p className={styles.infoText}>Código postal: {order.customer.postalCode}</p>
          <p className={styles.infoText}>Teléfono: {order.customer.phone}</p>
          <p className={styles.infoText}>Correo: {order.customer.email}</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Envío y pago</h2>
          <p className={styles.infoText}>Envío: {order.shippingMethod.label}</p>
          <p className={styles.infoText}>Pago: {order.paymentMethod.label}</p>
        </div>
      </div>
    </section>
  );
}

export default OrderDetail;