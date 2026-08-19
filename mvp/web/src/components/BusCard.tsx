import type { BusOffer } from '../mocks/cards';
import Pill from './Pill';
import StarRating from './StarRating';
import DeleteButton from './DeleteButton';

export default function BusCard({
  offer,
  onDetails,
  onDelete,
}: {
  offer: BusOffer;
  onDetails?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{offer.carrier}</span>
        <Pill>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {offer.rating.toFixed(1)} <StarRating count={1} size={11} />
          </span>
        </Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 13 }}>
          {offer.departure} → {offer.arrival}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{offer.durationLabel}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
        {offer.fromStation} → {offer.toStation}
      </div>
      <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {offer.price.toLocaleString('ru-RU')} {offer.currency}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>за пассажира</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onDetails}
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
          {onDelete && <DeleteButton onClick={onDelete} label="Удалить автобус" />}
        </div>
      </div>
    </div>
  );
}
