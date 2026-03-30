import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // ← nuevo

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import styles from './styles/CategoryProducts.module.css';
import productListStyles from '../page/styles/ProductList.module.css';
import { loadProducts } from '../utils/productStorage';

function CategoryProducts({ cartItems, onAddToCart }) { // ← elimina category y onBack
  const { categoryName } = useParams(); // ← obtiene categoria desde la URL
  const navigate = useNavigate();       // ← reemplaza onBack

  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productsState] = useState(loadProducts);

  const cartQuantityByProductId = useMemo(
    () => new Map(cartItems.map((item) => [item.id, item.quantity])),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    if (!categoryName) return [];

    const q = query.trim().toLowerCase();

    return productsState.filter((product) => {
      if (product.category !== categoryName) return false; // ← usa categoryName
      if (!q) return true;

      return String(product.name ?? '')
        .toLowerCase()
        .includes(q);
    });
  }, [categoryName, productsState, query]);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.btnBack} onClick={() => navigate('/')}>
          Volver  {/* ← navigate('/') reemplaza onBack */}
        </button>

        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{categoryName ?? 'Categoría'}</h1>
          <p className={styles.subtitle}>Filtra por nombre para encontrar un producto</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre..."
        />
      </div>

      {!categoryName ? (
        <p className={styles.empty}>Selecciona una categoría desde Inicio.</p>
      ) : filteredProducts.length === 0 ? (
        <p className={styles.empty}>No hay productos para mostrar.</p>
      ) : (
        <div className={productListStyles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              rating={product.rating}
              price={product.price}
              stock={product.stock}
              image={product.image}
              description={product.description}
              onAddToCart={onAddToCart}
              disableAddToCart={(cartQuantityByProductId.get(product.id) ?? 0) >= product.stock}
              onDetails={() => handleOpenDetails(product)}
            />
          ))}
        </div>
      )}

      <ProductDetailsModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseDetails}
      />
    </section>
  );
}

export default CategoryProducts;