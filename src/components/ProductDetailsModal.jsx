import { useEffect } from 'react';

import styles from './ProductDetailsModal.module.css';


// Componente modal para mostrar los detalles de un producto, prop isOpen controla si el modal esta abierto o cerrado, product es el producto a mostrar y onClose es la función para cerrar el modal
function ProductDetailsModal({ isOpen, product, onClose }) {
    //useeffecy controla si el modal esta abierto, si lo esta agrega un event listener para escuchar el evento de presionar una tecla, si la tecla es Escape se llama a la función onClose para cerrar el modal, y cuando el componente se desmonta o isOpen cambia a false se remueve el event listener para evitar fugas de memoria
  useEffect(() => {
    if (!isOpen) return;
    
    // el handleKeyDown escucha el evento de presionar una tecla, si la tecla es Escape se llama a la función onClose para cerrar el modal
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    //si no se cumple la condición de que el modal esta abierto no se agrega el event listener, y si se cumple se agrega el event listener para escuchar el evento de presionar una tecla, y cuando el componente se desmonta o isOpen cambia a false se remueve el event listener para evitar fugas de memoria
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
// si no esta abierto y no hay producto retorna null para no renderizar nada, si esta abierto y hay producto se muestra el modal con los detalles del producto, se muestra la imagen, la descripción, el precio formateado en pesos colombianos, el stock y la calificación si es un número finito entre 1 y 5, y se agrega un event listener para cerrar el modal al hacer click fuera del contenido del modal
  if (!isOpen || !product) {
    return null;
  }
 //aca se valida que la calificación sea un número finito, si lo es se muestra la calificación, si no se muestra null para no renderizar nada, esto es para evitar que si el producto no tiene una calificación válida no se muestre un valor incorrecto en el modal
  const ratingValue = Number(product.rating);
  const rating = Number.isFinite(ratingValue) ? ratingValue : null;
//aca cuando se pase el mouse se valida que .
  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };
 // se muestra el modal con los detalles del producto, se muestra la imagen, la descripción, el precio formateado en pesos colombianos, el stock y la calificación si es un número finito entre 1 y 5, y se agrega un event listener para cerrar el modal al hacer click fuera del contenido del modal
  return (
    // vigila el evento si el modal esta abierto y se hace click fuera del contenido del modal, se llama a la función onClose para cerrar el modal, esto se logra comparando el target del evento con el currentTarget, si son iguales significa que se hizo click en el overlay y no en el contenido del modal
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${product.name}`}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.category}>{product.category}</p>
            <h2 className={styles.title}>{product.name}</h2>
          </div>

          <button type="button" className={styles.btnClose} onClick={onClose}>
            Cerrar
          </button>
        </header>

        <div className={styles.content}>
          <img className={styles.image} src={product.image} alt={product.name} />

          <div className={styles.details}>
            <p className={styles.description}>{product.description}</p>

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Precio</span>
                <span className={styles.metaValue}>{(product.price)}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Stock</span>
                <span className={styles.metaValue}>{product.stock}</span>
              </div>

              {rating !== null ? (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Calificación</span>
                  <span className={styles.metaValue}>{rating}/5</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;