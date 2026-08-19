import type { TariffInfo } from '../mocks/trip';

export default function TariffCard({ tariff, onChange }: { tariff: TariffInfo; onChange?: () => void }) {
  return (
    <div style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{tariff.tariffClass}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {tariff.price} {tariff.currency}
          </div>
          {onChange && (
            <button
              type="button"
              onClick={onChange}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 999,
                padding: '8px 14px',
                fontSize: 13,
                color: 'var(--color-text-secondary)',
              }}
            >
              Изменить
            </button>
          )}
        </div>
      </div>
      <div style={{ marginTop: 8, color: tariff.refundable ? 'var(--color-success)' : 'var(--color-error)' }}>
        {tariff.refundable ? 'Возвратный тариф' : 'Невозвратный тариф'}
      </div>
      <div style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>{tariff.conditions}</div>
    </div>
  );
}
