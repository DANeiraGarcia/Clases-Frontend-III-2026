import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axiosClient from '../lib/axiosClient';
import useAuth from '../hooks/useAuth';
import styles from '../page/styles/OrderDetail.module.css';
import { loadOrdersByUserId } from '../utils/ordersStorage';
import { formatCOP } from '../utils/formatCOP';

function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    axiosClient
      .get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data || null))
      .catch(() => {
        // Si falla, usa los órdenes locales como fallback
        const localOrder =
          loadOrdersByUserId(currentUser?.id).find((savedOrder) => savedOrder.id === orderId) ??
          null;
        setOrder(localOrder);
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id, orderId]);

  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Historial</p>
          <h1 className={styles.title}>Orden no encontrada</h1>
          <p className={styles.subtitle}>
            El identificador solicitado no pertenece al usuario autenticado o ya no está disponible
            en este navegador.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/user/orders')}
            >
              Volver al historial
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          </div>
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
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}></p>
          <h1 className={styles.title}>Detalle de orden</h1>
          <p className={styles.subtitle}>
            Consulta el pedido completo, con los datos del cliente, envio, pago y totales.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Volver al historial
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Mi perfil
          </button>
        </div>
      </header>
     <div className={styles.summaryGrid}>
      <div className={styles.summaryCard}>
       <span className={styles.label}>Orden</span>
       <strong>{order.orderNumber}</strong>
      </div>
      <div className={styles.summaryCard}>
        <span className={styles.label}>Fecha</span>
        <strong>{formattedDate}</strong>
     </div>
     <div className={styles.summaryCard}>
      <span className={styles.label}>Envio</span>
      <strong>{order.status ?? 'N/A'}</strong>
    </div>
    <div className={styles.summaryCard}>
     <span className={styles.label}>Pago</span>
     <strong>{'N/A'}</strong>
    </div>
    </div>

      <div className={styles.layout}>
  <section className={styles.card}>
    <h2 className={styles.sectionTitle}>Cliente</h2>
    <div className={styles.infoList}>
      <p>
        <strong>{order.userFullName}</strong>
      </p>
      <p>{order.userEmail}</p>
    </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Totales</h2>
          <div className={styles.totalRows}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(order.totals.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>IVA</span>
              <strong>{formatCOP(order.totals.tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Envio</span>
              <strong>{formatCOP(order.totals.shipping)}</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total</span>
              <strong>{formatCOP(order.totals.total)}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Productos</h2>
        <div className={styles.itemList}>
          {order.items.map((item) => (
            <article key={`${order.id}-${item.id}`} className={styles.item}>
              <img className={styles.itemImage} src={item.image} alt={item.productName} />
              <h3 className={styles.itemName}>{item.productName}</h3>
              <p className={styles.itemMeta}>SKU: {item.sku}</p>
              <p className={styles.itemMeta}>Cantidad: {item.quantity}</p>
              <strong className={styles.itemPrice}>{formatCOP(item.lineTotal)}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default OrderDetail;
