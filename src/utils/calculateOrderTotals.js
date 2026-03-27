export const TAX_RATE = 0.19;

export const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    label: 'Envío estándar',
    description: 'Entrega entre 3 y 5 días hábiles.',
    price: 15000,
  },
  {
    id: 'express',
    label: 'Envío express',
    description: 'Entrega prioritaria en 24 horas.',
    price: 25000,
  },
];

export const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Tarjeta de crédito',
    description: 'Pago inmediato con validación simulada.',
  },
  {
    id: 'transfer',
    label: 'Transferencia bancaria',
    description: 'Confirmación manual del pago en la orden.',
  },
  {
    id: 'cash',
    label: 'Pago contra entrega',
    description: 'El cobro se realiza cuando recibes el pedido.',
  },
];

export function getShippingOptionById(shippingMethodId) {
  return SHIPPING_OPTIONS.find((option) => option.id === shippingMethodId) ?? SHIPPING_OPTIONS[0];
}

export function getPaymentMethodById(paymentMethodId) {
  return PAYMENT_METHODS.find((option) => option.id === paymentMethodId) ?? PAYMENT_METHODS[0];
}

export function calculateCartSubtotal(cartItems) {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function calculateOrderTotals(cartItems, shippingMethodId = SHIPPING_OPTIONS[0].id) {
  const subtotal = calculateCartSubtotal(cartItems);

  if (subtotal === 0) {
    return {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      shippingOption: getShippingOptionById(shippingMethodId),
    };
  }

  const shippingOption = getShippingOptionById(shippingMethodId);
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = shippingOption.price;

  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    shippingOption,
  };
}