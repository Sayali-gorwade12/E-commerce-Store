import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, ArrowLeft, Trash2, Truck, ShieldCheck } from 'lucide-react';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, clearCart, cartCount, subtotal, shippingFee, total, freeShippingThreshold, formatPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <EmptyState
          icon={ShoppingCart}
          title="Your shopping cart is currently empty"
          description="Looks like you haven't added any products to your cart yet. Explore our curated collections to find what you need."
          actionText="Continue Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const amountNeededForFreeShipping = Math.max(0, Number((freeShippingThreshold - subtotal).toFixed(2)));
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Shopping Cart
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review your selected items ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="btn btn-sm btn-secondary"
          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
        >
          <Trash2 size={15} />
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', fontSize: '0.92rem' }}>
          <Truck size={18} style={{ color: 'var(--primary)' }} />
          {shippingFee === 0 ? (
            <span style={{ fontWeight: 600, color: 'var(--success)' }}>
              Congratulations! You unlocked Free Delivery!
            </span>
          ) : (
            <span>
              Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more to qualify for <strong>FREE Delivery</strong>!
            </span>
          )}
        </div>
        <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: shippingFee === 0 ? 'var(--success)' : 'var(--primary)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        {/* Cart Items List */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/products" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '90px'
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Subtotal ({cartCount} items)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatPrice(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Shipping Fee</span>
              {shippingFee === 0 ? (
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>FREE</span>
              ) : (
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatPrice(shippingFee)}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1.25rem 0' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Estimated Total</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(total)}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginBottom: '1rem' }}
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <ShieldCheck size={16} />
            <span>Secure Checkout • Cash on Delivery Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
