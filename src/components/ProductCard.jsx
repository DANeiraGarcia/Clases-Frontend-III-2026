
import styles from './ProductCard.module.css';
import {useState} from 'react'

function ProductCard({name,category,price,image,description}) {
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1); // resta 1 y lo pone en falso y esto se llama hook
            setIsLiked(false);
        } else {
            setLikes(likes + 1); // se controlan los estados de los likes y si el producto esta o no likeado
            setIsLiked(true);
        }
    };
    

    return (
        <article className={styles.productCard}>
            <img src={image} alt={name} className={styles.productImage} />
            <div className={styles.productInfo}>
                <span className={styles.productCategory}>{category}</span>
                <h3 className={styles.productName}>{name}</h3>
                <p className={styles.productDescription}>{description}</p>
                <div className={styles.productFooter}>
                    <span className={styles.productPrice}>${price.toFixed(2)}</span>
                    <button 
                    className={`${styles.btnLike} ${isLiked ? styles.liked : ''}`} 
                    onClick={handleLike}
                    >
                        {isLiked ? '❤' : '🤍'} {likes} Me gusta
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;