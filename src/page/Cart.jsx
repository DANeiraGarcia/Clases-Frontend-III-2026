import styles from './Cart.module.css';

import { calculateCartSubtotal } from '../utils/calculateOrderTotals';
import { formatCOP } from '../utils/formatCOP';

function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onProceedToCheckout,
}) {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = calculateCartSubtotal(cartItems);

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        /* estado vacío existente */
      </section>
    );
  }

  return (
    <section className={styles.container}>
      /* contenido existente */
      <aside className={styles.summary}>
        /* resumen existente */
        <button type="button" className={styles.btnClear} onClick={onClearCart}>
          Vaciar carrito
        </button>

        <button type="button" className={styles.btnCheckout} onClick={onProceedToCheckout}>
          Proceder al checkout
        </button>
      </aside>
    </section>
  );
}

export default Cart;