const STORAGE_KEY = 'orders';

const normalizeOrderItem = (item) => ({
  id: Number(item?.id),
  name: String(item?.name ?? 'Producto'),
  category: String(item?.category ?? 'Sin categoría'),
  price: Number(item?.price) || 0,
  stock: Number(item?.stock) || 0,
  image: String(item?.image ?? ''),
  quantity: Math.max(1, Math.floor(Number(item?.quantity) || 1)),
});

const normalizeOrder = (order) => ({
  id: String(order?.id ?? ''),
  createdAt: String(order?.createdAt ?? new Date().toISOString()),
  items: Array.isArray(order?.items) ? order.items.map(normalizeOrderItem) : [],
  customer: {
    fullName: String(order?.customer?.fullName ?? ''),
    email: String(order?.customer?.email ?? ''),
    phone: String(order?.customer?.phone ?? ''),
    address: String(order?.customer?.address ?? ''),
    city: String(order?.customer?.city ?? ''),
    postalCode: String(order?.customer?.postalCode ?? ''),
  },
  shippingMethod: {
    id: String(order?.shippingMethod?.id ?? 'standard'),
    label: String(order?.shippingMethod?.label ?? 'Envío estándar'),
    description: String(order?.shippingMethod?.description ?? ''),
    price: Number(order?.shippingMethod?.price) || 0,
  },
  paymentMethod: {
    id: String(order?.paymentMethod?.id ?? 'card'),
    label: String(order?.paymentMethod?.label ?? 'Tarjeta de crédito'),
    description: String(order?.paymentMethod?.description ?? ''),
  },
  totals: {
    subtotal: Number(order?.totals?.subtotal) || 0,
    tax: Number(order?.totals?.tax) || 0,
    shipping: Number(order?.totals?.shipping) || 0,
    total: Number(order?.totals?.total) || 0,
  },
});

export function loadOrders() {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeOrder).filter((order) => order.id);
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedOrder = normalizeOrder(order);
  const currentOrders = loadOrders();

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([normalizedOrder, ...currentOrders]));
}

export const ORDERS_STORAGE_KEY = STORAGE_KEY;