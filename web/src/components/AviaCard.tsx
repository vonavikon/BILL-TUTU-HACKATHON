import type { AviaOffer } from '../mocks/cards';
import Pill from './Pill';
import DeleteButton from './DeleteButton';

export default function AviaCard({
  offer,
  onChange,
  onDelete,
}: {
  offer: AviaOffer;
  onChange?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{offer.carrier}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{offer.fromCode}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{offer.departure}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {offer.durationLabel} · {offer.stopsLabel}
          </div>
          <div style={{ height: 1, background: 'var(--color-border)', marginTop: 4 }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{offer.toCode}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{offer.arrival}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <Pill>{offer.fareClass}</Pill>
        {offer.refundable && <Pill kind="positive">Возврат по тарифу</Pill>}
      </div>
      <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {offer.price.toLocaleString('ru-RU')} {offer.currency}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>за 1 взрослого</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
          {onDelete && <DeleteButton onClick={onDelete} label="Удалить рейс" />}
        </div>
      </div>
    </div>
  );
}
