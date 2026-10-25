import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search products by name...' }) {
  return (
    <div className="search-box">
      <Search size={18} style={{ color: 'var(--text-muted)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
