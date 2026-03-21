const STORAGE_KEY = 'cartItems';

const clampQuantity = (value, maxStock) => {
  const parsed = Number(value);
  const normalizedMaxStock =
    Number.isFinite(Number(maxStock)) && Number(maxStock) > 0 ? Number(maxStock) : 1;

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(normalizedMaxStock, Math.max(1, Math.floor(parsed)));
};

const normalizeCartItem = (item) => {
  const stock =
    Number.isFinite(Number(item?.stock)) && Number(item.stock) > 0 ? Number(item.stock) : 1;

  return {
    id: Number(item?.id),
    name: String(item?.name ?? 'Producto'),
    category: String(item?.category ?? 'Sin categoría'),
    price: Number(item?.price) || 0,
    stock,
    image: String(item?.image ?? ''),
    quantity: clampQuantity(item?.quantity, stock),
  };
};

export function loadCartItems() {
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

    return parsed
      .map(normalizeCartItem)
      .filter((item) => Number.isFinite(item.id) && item.quantity > 0);
  } catch {
    return [];
  }
}

export const CART_STORAGE_KEY = STORAGE_KEY;