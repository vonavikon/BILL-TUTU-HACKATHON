interface OptionRowProps {
  title: string;
  meta: string;
  price: number;
  currency: string;
  selected?: boolean;
  onSelect: () => void;
}

export default function OptionRow({ title, meta, price, currency, selected, onSelect }: OptionRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
        border: selected ? '2px solid var(--color-primary)' : '2px solid transparent',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{meta}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
          {price.toLocaleString('ru-RU')} {currency}
        </div>
        <button
          type="button"
          onClick={onSelect}
          disabled={selected}
          style={{
            background: selected ? 'var(--color-border)' : 'var(--color-primary)',
            color: selected ? 'var(--color-text-secondary)' : 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 999,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {selected ? 'Выбрано' : 'Выбрать'}
        </button>
      </div>
    </div>
  );
}
