import {useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../page/styles/Checkout.module.css';
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
  const navigate = useNavigate();

useEffect(() => {
    setValues((currentValues) => ({
      ...currentValues,
      fullName: user?.name ?? currentValues.fullName,
      email: user?.email ?? currentValues.email,
      phone: user?.phone ?? currentValues.phone,
      address: user?.address ?? currentValues.address,
      city: user?.city ?? currentValues.city,
      postalCode: user?.postalCode ?? currentValues.postalCode,
    }));
  }, [user]);

  const totals = useMemo(
    () => calculateOrderTotals(cartItems, values.shippingMethod),
    [cartItems, values.shippingMethod]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const order = onCompleteCheckout({
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

    if (order) {
      navigate('/order-confirmation');
    } else {
      navigate('/cart');
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.emptyText}>
            No hay productos en el carrito. Regresa para agregar artículos antes de continuar.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/cart')}
          >
            Volver al carrito
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}></p>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>
            Completa los datos de entrega y confirma el pedido.
          </p>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={() => navigate('/cart')}>
          Volver al carrito
        </button>
      </header>

      <div className={styles.layout}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos del cliente</h2>

            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Nombre completo</span>
                <input
                  className={styles.input}
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  placeholder="Ejemplo: Ana Gómez"
                />
                {errors.fullName ? <span className={styles.error}>{errors.fullName}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Correo electrónico</span>
                <input
                  className={styles.input}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="correo@dominio.com"
                  type="email"
                />
                {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Teléfono</span>
                <input
                  className={styles.input}
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
                {errors.phone ? <span className={styles.error}>{errors.phone}</span> : null}
              </label>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span className={styles.label}>Dirección</span>
                <input
                  className={styles.input}
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  placeholder="Calle 10 # 20-30"
                />
                {errors.address ? <span className={styles.error}>{errors.address}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Ciudad</span>
                <input
                  className={styles.input}
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder="Medellín"
                />
                {errors.city ? <span className={styles.error}>{errors.city}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Código postal</span>
                <input
                  className={styles.input}
                  name="postalCode"
                  value={values.postalCode}
                  onChange={handleChange}
                  placeholder="050021"
                />
                {errors.postalCode ? (
                  <span className={styles.error}>{errors.postalCode}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Método de envío</h2>
            <div className={styles.optionList}>
              {SHIPPING_OPTIONS.map((option) => (
                <label key={option.id} className={styles.optionCard}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.id}
                    checked={values.shippingMethod === option.id}
                    onChange={handleChange}
                  />
                  <div>
                    <span className={styles.optionTitle}>{option.label}</span>
                    <p className={styles.optionDescription}>{option.description}</p>
                  </div>
                  <strong className={styles.optionPrice}>{formatCOP(option.price)}</strong>
                </label>
              ))}
            </div>
            {errors.shippingMethod ? (
              <span className={styles.error}>{errors.shippingMethod}</span>
            ) : null}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Método de pago</h2>
            <div className={styles.optionList}>
              {PAYMENT_METHODS.map((option) => (
                <label key={option.id} className={styles.optionCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={values.paymentMethod === option.id}
                    onChange={handleChange}
                  />
                  <div>
                    <span className={styles.optionTitle}>{option.label}</span>
                    <p className={styles.optionDescription}>{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.paymentMethod ? (
              <span className={styles.error}>{errors.paymentMethod}</span>
            ) : null}
          </section>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/cart')}
            >
              Volver
            </button>
            <button type="submit" className={styles.primaryButton}>
              Confirmar compra
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Resumen del pedido</h2>

          <div className={styles.summaryList}>
            {cartItems.map((item) => (
              <article key={item.id} className={styles.summaryItem}>
                <img className={styles.summaryImage} src={item.image} alt={item.name} />
                <div>
                  <h3 className={styles.summaryName}>{item.name}</h3>
                  <p className={styles.summaryMeta}>
                    {item.quantity} x {formatCOP(item.price)}
                  </p>
                </div>
                <strong className={styles.summaryPrice}>
                  {formatCOP(item.price * item.quantity)}
                </strong>
              </article>
            ))}
          </div>

          <div className={styles.totalRows}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(totals.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>IVA (19%)</span>
              <strong>{formatCOP(totals.tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>{totals.shippingOption.label}</span>
              <strong>{formatCOP(totals.shipping)}</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total</span>
              <strong>{formatCOP(totals.total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
