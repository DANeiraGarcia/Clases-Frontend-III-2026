import {products}from "../data/Products";
import ProductCard from "../components/ProductCard"; // cuando tiene default el nomre del componente es el que se importa y no va en llaves
import styles from "../components/ProductCard.module.css";

function ProductList() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Productos Informaticos</h1>
                <p className={styles.subtitle}>Explora nuestra selección de productos informáticos de alta calidad.</p>
            </header>
            <div className={styles.grid}>
                {products.map((product) => (
                    <ProductCard key={product.id}  // desde aca llamo el componente ProductCard y le paso las propiedades del producto
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    image={product.image}
                    description={product.description}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProductList;

