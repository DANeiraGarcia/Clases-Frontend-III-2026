import { products } from '../data/Products';
import ProductCard from '../components/ProductCard'; // cuando tiene default el nomre del componente es el que se importa y no va en llaves
import styles from './ProductList.module.css';
import { useState } from "react";
import ProductForm from '../components/ProductForm';





function ProductList() {

    const [productsState, setProductsState] = useState(products);
    const handleAddProduct = (product) => {
        console.log("Producto recibido desde el form:", product);
    };
    const handleDeleteProduct = (id) => {
    setProductsState((prev) => prev.filter((product) => product.id !== id));
    };
    const [editingProduct, setEditingProduct] = useState(null);

    const handleEditStart = (product) => {
    setEditingProduct(product);
  };

   const handleEditCancel = () => {
   setEditingProduct(null);
   };

    const handleEditSubmit = (updatedProduct) => {
    setProductsState((prev) =>
    prev.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product,
    ),
  );

  setEditingProduct(null);
};

    
    return (
        <div className = {styles.container}>
            <header className = {styles.header}>
            <h1 className = {styles.title}>Lista de Productos</h1>
            <p className = {styles.description}>Explora nuestra selección de productos!</p>
            </header>

            <ProductForm
              initialValues={editingProduct}
              isEditing={Boolean(editingProduct)}
              onCancel={handleEditCancel}
              onSubmit={editingProduct ? handleEditSubmit : handleAddProduct}
            />

            <div className = {styles.grid}>
            {productsState.map(product => (
                <ProductCard
                key={product.id}
                name={product.name}
                category={product.category}
                stock={product.stock}
                price={product.price}
                image={product.image}
                description={product.description}
                onDelete={() => handleDeleteProduct(product.id)}
                onEdit={() => handleEditStart(product)}
                />
            ))}
            </div>
        </div>
    )          
}
 
export default ProductList;
