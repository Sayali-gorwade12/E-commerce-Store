import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function SortDropdown({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
        style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
      >
        <option value="newest">Sort by: Newest Arrivals</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A to Z</option>
      </select>
    </div>
  );
}
