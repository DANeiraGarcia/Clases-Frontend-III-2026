function ProductCard({name,category,price,image,description}) {
    return (
        <article className="product-card">
            <img src={image} alt={name} className="product-image" />
            <div className="product-info">
                <span className="product-category">{category}</span>
                <h3 className="product-name">{name}</h3>
                <p className="product-description">{description}</p>
                <div className="product-footer">
                    <span className="product-price">${price.toFixed(2)}</span>
                    <button className="btn-like">Me gusta</button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;