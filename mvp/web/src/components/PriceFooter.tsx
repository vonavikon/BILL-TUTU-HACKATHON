interface PriceFooterProps {
  price: number;
  currency: string;
  onCheckout: () => void;
}

export default function PriceFooter({ price, currency, onCheckout }: PriceFooterProps) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '16px 24px',
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Итого</div>
        <div style={{ fontWeight: 700, fontSize: 20 }}>
          {price} {currency}
        </div>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '14px 28px',
          fontWeight: 700,
        }}
      >
        Перейти в корзину
      </button>
    </div>
  );
}
