import type { SeatInfo } from '../mocks/trip';

export default function SeatSummaryCard({ seat, onChange }: { seat: SeatInfo; onChange?: () => void }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            Вагон {seat.carNumber} · Место {seat.seatNumber}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 2 }}>
            {seat.tier} полка · {seat.compartmentGender === 'любой' ? 'любой состав купе' : `купе ${seat.compartmentGender}`}
          </div>
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
      <div style={{ background: 'var(--color-primary-tint)', borderRadius: 'var(--radius-md)', padding: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Место {seat.seatNumber} — почему подходит</div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{seat.explanation}</div>
      </div>
    </div>
  );
}
