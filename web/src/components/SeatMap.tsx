import type { SeatInfo, SeatMapCell } from '../mocks/trip';

interface SeatMapProps {
  cells: SeatMapCell[];
  seat: SeatInfo;
  onSelectSeat?: (seatNumber: number) => void;
}

export default function SeatMap({ cells, seat, onSelectSeat }: SeatMapProps) {
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
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Вагон {seat.carNumber}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {cells.map((cell) => {
          const cellStyle = {
            width: '100%',
            padding: 12,
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center' as const,
            border: 'none',
            background: cell.recommended
              ? 'var(--color-primary)'
              : cell.occupied
                ? 'var(--color-border)'
                : 'var(--color-primary-tint)',
            color: cell.recommended ? 'var(--color-on-primary)' : 'var(--color-text)',
            opacity: cell.occupied && !cell.recommended ? 0.5 : 1,
          };
          const content = (
            <>
              <div style={{ fontWeight: 700 }}>{cell.seatNumber}</div>
              <div style={{ fontSize: 12 }}>{cell.tier}</div>
            </>
          );
          return onSelectSeat ? (
            <button
              key={cell.seatNumber}
              type="button"
              data-testid={`seat-${cell.seatNumber}`}
              disabled={cell.occupied && !cell.recommended}
              onClick={() => onSelectSeat(cell.seatNumber)}
              style={{ ...cellStyle, cursor: cell.occupied && !cell.recommended ? 'not-allowed' : 'pointer' }}
            >
              {content}
            </button>
          ) : (
            <div key={cell.seatNumber} data-testid={`seat-${cell.seatNumber}`} style={cellStyle}>
              {content}
            </div>
          );
        })}
      </div>
      <div style={{ background: 'var(--color-primary-tint)', borderRadius: 'var(--radius-md)', padding: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Место {seat.seatNumber} — почему подходит</div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{seat.explanation}</div>
      </div>
    </div>
  );
}
