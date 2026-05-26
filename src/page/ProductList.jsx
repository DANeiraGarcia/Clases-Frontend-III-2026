import { useEffect, useState } from 'react';

import axiosClient from '../lib/axiosClient';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import styles from '../page/styles/ProductList.module.css';
import { PRODUCTS_STORAGE_KEY } from '../utils/productStorage';
import ProductDetailsModal from '../components/ProductDetailsModal';

// se importa la función para cargar los productos y la constante con el nombre de la clave de almacenamiento

const STORAGE_KEY = PRODUCTS_STORAGE_KEY;

function ProductList() {
  const [productsState, setProductsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    axiosClient
      .get('/products')
      .then((res) => setProductsState(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleAddProduct = async (product) => {
  try {
    const res = await axiosClient.post('/products', {
      name: product.name,
      description: product.description,
      price: product.price,
      stockQty: product.stock,
      image: product.image,
      rating: product.rating,
      categoryId: 2,
      isActive: true,
    });
    console.log('Respuesta del backend:', res.data);
    setProductsState((prev) => [...prev, res.data]);
    handleCloseForm();
  } catch (err) {
    console.error('Error al agregar producto', err);
  }
};

  const handleDeleteProduct = async (productId) => {
  console.log('Eliminando:', productId);
  try {
    await axiosClient.delete(`/products/${productId}`);
    setProductsState((prev) => prev.filter((p) => p.productId !== productId));
    if (editingProduct?.productId === productId) handleCloseForm();
  } catch (err) {
    console.error('Error al eliminar producto', err);
  }
};

  const handleEditStart = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleEditSubmit = async (updatedProduct) => {
    console.log('Editando:', updatedProduct);
  try {
    const res = await axiosClient.put(`/products/${updatedProduct.productId}`, {
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      stockQty: updatedProduct.stock,
      image: updatedProduct.image,
      rating: updatedProduct.rating,
      sku: updatedProduct.sku,
      categoryId: 2,
      isActive: true,
    });
    setProductsState((prev) =>
      prev.map((p) => (p.productId === updatedProduct.productId ? res.data : p))
    );
    handleCloseForm();
  } catch (err) {
    console.error('Error al editar producto', err);
  }
};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Productos Informáticos</h1>
        <p className={styles.subtitle}>
          Encuentra los mejores productos de tecnología para tu setup
        </p>
      </header>

      {isFormOpen ? (
        <ProductForm
          initialValues={editingProduct}
          isEditing={Boolean(editingProduct)}
          onCancel={handleCloseForm}
          onSubmit={editingProduct ? handleEditSubmit : handleAddProduct}
        />
      ) : (
        <>
          <div className={styles.toolbar}>
            <button className={styles.btnAdd} type="button" onClick={handleOpenCreate}>
              Agregar producto
            </button>
          </div>

          <div className={styles.grid}>
            {productsState.map((product) => (
              <ProductCard
                key={product.productId}
                name={product.name}
                category={product.categoryName}
                price={product.price}
                rating={product.rating}
                stock={product.stockQty}
                image={product.image}
                description={product.description}
                onDelete={() => handleDeleteProduct(product.productId)}
                onEdit={() => handleEditStart(product)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;
