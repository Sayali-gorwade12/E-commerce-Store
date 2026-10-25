import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ quantity, stock, onChange, min = 1 }) {
  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < stock) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="quantity-control">
      <button
        type="button"
        className="qty-btn"
        onClick={handleDecrement}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>
      <span className="qty-val">{quantity}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={handleIncrement}
        disabled={quantity >= stock}
        aria-label="Increase quantity"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
