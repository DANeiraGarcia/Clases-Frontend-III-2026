import { useMemo, useState } from 'react';

import styles from '../page/Checkout.module.css';
import {
  calculateOrderTotals,
  PAYMENT_METHODS,
  SHIPPING_OPTIONS,
} from '../utils/calculateOrderTotals';
import { formatCOP } from '../utils/formatCOP';

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;

function Checkout({ cartItems, user, onBack, onCompleteCheckout }) {
  const [values, setValues] = useState({
    fullName: user?.name ?? '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    shippingMethod: SHIPPING_OPTIONS[0].id,
    paymentMethod: PAYMENT_METHODS[0].id,
  });
  const [errors, setErrors] = useState({});

  const totals = useMemo(
    () => calculateOrderTotals(cartItems, values.shippingMethod),
    [cartItems, values.shippingMethod]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
  };

  const validateValues = () => {
    const nextErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = 'Ingresa el nombre completo.';
    if (!values.email.trim()) nextErrors.email = 'Ingresa un correo electrónico.';
    if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!values.phone.trim()) nextErrors.phone = 'Ingresa un número de contacto.';
    if (!values.address.trim()) nextErrors.address = 'Ingresa la dirección de entrega.';
    if (!values.city.trim()) nextErrors.city = 'Ingresa la ciudad.';
    if (!values.postalCode.trim()) nextErrors.postalCode = 'Ingresa el código postal.';
    if (!values.shippingMethod) nextErrors.shippingMethod = 'Selecciona un método de envío.';
    if (!values.paymentMethod) nextErrors.paymentMethod = 'Selecciona un método de pago.';
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateValues();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onCompleteCheckout({
      customer: {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        postalCode: values.postalCode.trim(),
      },
      shippingMethodId: values.shippingMethod,
      paymentMethodId: values.paymentMethod,
    });
  };

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.emptyText}>
            No hay productos en el carrito. Regresa para agregar artículos antes de continuar.
          </p>
          <button type="button" className={styles.secondaryButton} onClick={onBack}>
            Volver al carrito
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Volver al carrito
        </button>
        <div>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>Completa tus datos para finalizar la compra.</p>
        </div>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.fieldset}>
            <h3 className={styles.legend}>Datos de contacto</h3>

            <label className={styles.field}>
              <span className={styles.label}>Nombre completo</span>
              <input
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
              />
              {errors.fullName ? <span className={styles.error}>{errors.fullName}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Correo electrónico</span>
              <input
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Ej: juan@correo.com"
              />
              {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Teléfono</span>
              <input
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                name="phone"
                value={values.phone}
                onChange={handleChange}
                placeholder="Ej: 3001234567"
              />
              {errors.phone ? <span className={styles.error}>{errors.phone}</span> : null}
            </label>
          </div>

          <div className={styles.fieldset}>
            <h3 className={styles.legend}>Dirección de entrega</h3>

            <label className={styles.field}>
              <span className={styles.label}>Dirección</span>
              <input
                className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                name="address"
                value={values.address}
                onChange={handleChange}
                placeholder="Ej: Calle 10 # 20-30"
              />
              {errors.address ? <span className={styles.error}>{errors.address}</span> : null}
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Ciudad</span>
                <input
                  className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder="Ej: Medellín"
                />
                {errors.city ? <span className={styles.error}>{errors.city}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Código postal</span>
                <input
                  className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`}
                  name="postalCode"
                  value={values.postalCode}
                  onChange={handleChange}
                  placeholder="Ej: 050001"
                />
                {errors.postalCode ? <span className={styles.error}>{errors.postalCode}</span> : null}
              </label>
            </div>
          </div>

          <div className={styles.fieldset}>
            <h3 className={styles.legend}>Método de envío</h3>
            <div className={styles.optionList}>
              {SHIPPING_OPTIONS.map((option) => (
                <label key={option.id} className={`${styles.optionCard} ${values.shippingMethod === option.id ? styles.optionSelected : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.id}
                    checked={values.shippingMethod === option.id}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <div className={styles.optionInfo}>
                    <div>
                      <span className={styles.optionName}>{option.label}</span>
                      <p className={styles.optionDescription}>{option.description}</p>
                    </div>
                    <span className={styles.optionPrice}>
                      {option.price === 0 ? 'Gratis' : formatCOP(option.price)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.shippingMethod ? <span className={styles.error}>{errors.shippingMethod}</span> : null}
          </div>

          <div className={styles.fieldset}>
            <h3 className={styles.legend}>Método de pago</h3>
            <div className={styles.optionList}>
              {PAYMENT_METHODS.map((method) => (
                <label key={method.id} className={`${styles.optionCard} ${values.paymentMethod === method.id ? styles.optionSelected : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={values.paymentMethod === method.id}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <div className={styles.optionInfo}>
                    <div>
                      <span className={styles.optionName}>{method.label}</span>
                      <p className={styles.optionDescription}>{method.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.paymentMethod ? <span className={styles.error}>{errors.paymentMethod}</span> : null}
          </div>

          <button type="submit" className={styles.primaryButton}>
            Confirmar pedido
          </button>
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumen del pedido</h2>
          <div className={styles.summaryItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <span className={styles.summaryItemName}>{item.name} x{item.quantity}</span>
                <span className={styles.summaryItemPrice}>{formatCOP(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatCOP(totals.subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envío</span>
              <span>{totals.shipping === 0 ? 'Gratis' : formatCOP(totals.shipping)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formatCOP(totals.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
