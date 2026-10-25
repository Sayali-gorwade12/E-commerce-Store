import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, ShieldCheck, Truck, RotateCcw, ArrowLeft, AlertCircle, Zap } from 'lucide-react';
import QuantitySelector from '../components/QuantitySelector';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatPrice } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/products/${id}`);
        if (res.data?.success && res.data?.data) {
          const prod = res.data.data;
          setProduct(prod);
          setImgSrc(prod.image_url || DEFAULT_IMAGE);
          setQuantity(1);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found or invalid product ID.');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <ErrorMessage message={error || 'Product could not be loaded.'} />
        <Link to="/products" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} />
          Back to All Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--text-muted)' }}>
          {product.category}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '3rem',
          background: 'white',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Product Media Column */}
        <div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '80%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#f8fafc',
              border: '1px solid var(--border)'
            }}
          >
            <img
              src={imgSrc}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={() => setImgSrc(DEFAULT_IMAGE)}
            />
          </div>
        </div>

        {/* Product Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              display: 'inline-block',
              alignSelf: 'flex-start',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {product.category}
          </span>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', margin: '1rem 0 1.25rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatPrice(product.price)}
            </span>
            <span className={`stock-tag ${isOutOfStock ? 'stock-out' : 'stock-in'}`} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
              {isOutOfStock ? 'Currently Out of Stock' : `${product.stock} units available`}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0', margin: '0.5rem 0 1.5rem 0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Product Overview
            </h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>

          {/* Purchasing actions */}
          <div style={{ marginBottom: '2rem' }}>
            {!isOutOfStock ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quantity:</label>
                  <QuantitySelector
                    quantity={quantity}
                    stock={product.stock}
                    onChange={setQuantity}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="btn btn-secondary btn-lg"
                    style={{ flex: 1, minWidth: '180px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    <Zap size={20} />
                    Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="alert alert-danger">
                <AlertCircle size={20} />
                <span>This item is currently sold out. Check back soon for stock replenishment.</span>
              </div>
            )}
          </div>

          {/* Value Assurances */}
          <div style={{ marginTop: 'auto', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Truck size={18} style={{ color: 'var(--primary)' }} />
                <span>Free delivery over ₹999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <RotateCcw size={18} style={{ color: 'var(--primary)' }} />
                <span>7-Day Return Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
