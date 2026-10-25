import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { formatPrice } = useCart();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && orderNumber) {
      async function fetchOrder() {
        try {
          setLoading(true);
          const res = await api.get(`/orders/${orderNumber}`);
          if (res.data?.success && res.data?.data) {
            setOrder(res.data.data);
          }
        } catch (err) {
          setError('Could not retrieve order details.');
        } finally {
          setLoading(false);
        }
      }
      fetchOrder();
    }
  }, [order, orderNumber]);

  if (loading) {
    return <LoadingSpinner message="Fetching order receipt..." />;
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '680px' }}>
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}
        >
          <CheckCircle size={36} />
        </div>

        <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Order Successfully Placed
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          Thank You For Shopping With Us!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.75rem auto' }}>
          Your order has been recorded in the database. A dispatch notification will be generated once your items are prepared.
        </p>

        {/* Order Details Summary Box */}
        <div
          style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Reference Number:</span>
            <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1rem' }}>
              {order?.order_number || orderNumber}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>
              {order?.order_status || 'Placed'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {order?.payment_method || 'Cash on Delivery'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Deliver To:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
              {order?.customer_name} ({order?.city}, {order?.state})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontSize: '1.05rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total Paid / Payable:</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>
              {formatPrice(order?.total_amount || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-primary">
            <Package size={18} />
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <Home size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
