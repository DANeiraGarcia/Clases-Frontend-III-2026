import { useMemo, useState } from 'react';

import styles from '../styles/Checkout.module.css';
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
      /* header, formulario, opciones y resumen */
    </section>
  );
}

export default Checkout;