import styles from './ProductCard.module.css';
import { useState } from 'react';

function ProductCard({ id, name, category, price, stock, image, description, rating, onDetails, onDelete, onEdit, onAddToCart, disableAddToCart = false }) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  return (
    <article className={styles.productCard}>
      <img src={image} alt={name} className={styles.productImage} />
      <div className={styles.productInfo}>
        <span className={styles.productCategory}>{category}</span>
        <h3 className={styles.productName}>{name}</h3>
        {Number.isFinite(Number(rating)) ? (
          <p className={styles.productRating}>⭐Calificación: {Number(rating)}/5</p>
        ) : null}
        <p className={styles.productDescription}>{description}</p>
        <p className={styles.productStock}>Stock: {stock}</p>
        <div className={styles.productFooter}>
          <span className={styles.productPrice}>${price.toFixed(2)}</span>
          <button
            className={`${styles.btnLike} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
          >
            {isLiked ? '❤' : '🤍'} {likes}
          </button>

          {onAddToCart || onDetails || onEdit || onDelete ? (
            <div className={styles.cardActions}>
              {onAddToCart ? (
                <button
                  type="button"
                  className={styles.btnAddToCart}
                  onClick={() => onAddToCart({ id, name, category, price, stock, image })}
                  disabled={disableAddToCart}
                >
                  {disableAddToCart ? 'Stock agotado en carrito' : 'Agregar al carrito'}
                </button>
              ) : null}

              {onDetails ? (
                <button type="button" className={styles.btnDetails} onClick={onDetails}>
                  Más información
                </button>
              ) : null}

              {onEdit ? (
                <button type="button" className={styles.btnEdit} onClick={onEdit}>
                  Editar
                </button>
              ) : null}

              {onDelete ? (
                <button type="button" className={styles.btnDelete} onClick={onDelete}>
                  Eliminar
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
