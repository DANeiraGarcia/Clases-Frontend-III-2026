import { products } from '../data/Products';
import ProductCard from '../components/ProductCard'; // cuando tiene default el nomre del componente es el que se importa y no va en llaves
import styles from '../components/ProductCard.module.css';
import { useState } from "react";
import ProductForm from '../components/ProductForm';





function ProductList() {

    const [productsState, setProductsState] = useState(products);
    const handleAddProduct = (product) => {
        console.log("Producto recibido desde el form:", product);
    };
    
    return (
        <div className = {styles.container}>
            <header className = {styles.header}>
            <h1 className = {styles.title}>Lista de Productos</h1>
            <p className = {styles.description}>Explora nuestra selección de productos!</p>
            </header>

            <ProductForm onSubmit={handleAddProduct} />

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
                />
            ))}
            </div>
        </div>
    )          
}
 
export default ProductList;
