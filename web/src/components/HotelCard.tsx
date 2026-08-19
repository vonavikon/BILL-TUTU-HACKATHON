import type { HotelOffer } from '../mocks/cards';
import Pill from './Pill';
import StarRating from './StarRating';
import DeleteButton from './DeleteButton';

export default function HotelCard({
  offer,
  onChange,
  onDelete,
}: {
  offer: HotelOffer;
  onChange?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-tint)',
            flexShrink: 0,
          }}
          aria-hidden
        />
        <div>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
            <StarRating count={offer.stars} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{offer.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill kind="positive">
              {offer.rating.toFixed(1)} {offer.rating >= 9 ? 'Отлично' : 'Хорошо'}
            </Pill>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {offer.reviewCount.toLocaleString('ru-RU')} отзывов
            </span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
        {offer.roomName} {offer.breakfastIncluded && '· завтрак включён'}
      </div>
      {offer.freeCancellation && (
        <div style={{ marginBottom: 10 }}>
          <Pill kind="positive">Бесплатная отмена</Pill>
        </div>
      )}
      <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            от {offer.price.toLocaleString('ru-RU')} {offer.currency}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>за всю поездку, с налогами</div>
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
          {onDelete && <DeleteButton onClick={onDelete} label="Удалить отель" />}
        </div>
      </div>
    </div>
  );
}
