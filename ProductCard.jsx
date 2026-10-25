import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

export default function ProductCard({ product }) {
  const { addToCart, formatPrice } = useCart();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image_url || DEFAULT_IMAGE);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock > 0) {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          className="product-image"
          onError={() => setImgSrc(DEFAULT_IMAGE)}
          loading="lazy"
        />
        <span className="product-category-badge">{product.category}</span>
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.id}`}>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
        </Link>
        <p className="product-desc-snippet">{product.description}</p>

        <div className="product-card-footer">
          <div>
            <div className="product-price">{formatPrice(product.price)}</div>
            <span className={`stock-tag ${isOutOfStock ? 'stock-out' : 'stock-in'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </span>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${added ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Product is currently sold out' : 'Add to cart'}
            style={added ? { background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' } : {}}
          >
            {added ? (
              <>
                <Check size={16} />
                Added
              </>
            ) : isOutOfStock ? (
              <>
                <AlertCircle size={16} />
                Sold Out
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
