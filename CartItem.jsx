import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../context/CartContext';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, formatPrice } = useCart();
  const [imgSrc, setImgSrc] = useState(item.image_url || DEFAULT_IMAGE);

  const lineTotal = Number((item.price * item.quantity).toFixed(2));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr auto auto auto',
        gap: '1rem',
        alignItems: 'center',
        padding: '1.25rem 0',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <Link to={`/products/${item.id}`} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f1f5f9' }}>
        <img
          src={imgSrc}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgSrc(DEFAULT_IMAGE)}
        />
      </Link>

      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
          {item.category}
        </span>
        <Link to={`/products/${item.id}`}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
            {item.name}
          </h4>
        </Link>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Unit Price: {formatPrice(item.price)}
        </p>
      </div>

      <div>
        <QuantitySelector
          quantity={item.quantity}
          stock={item.stock}
          onChange={(newQty) => updateQuantity(item.id, newQty)}
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
          Max {item.stock}
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '90px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {formatPrice(lineTotal)}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="btn btn-sm"
          style={{ color: 'var(--danger)', padding: '0.5rem' }}
          title="Remove from cart"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
