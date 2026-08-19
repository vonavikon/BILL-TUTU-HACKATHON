import type { TrainInfo } from '../mocks/trip';
import DeleteButton from './DeleteButton';

export default function TrainCard({
  train,
  onChange,
  onDelete,
}: {
  train: TrainInfo;
  onChange?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          {train.carrier} · {train.trainNumber}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
          {onDelete && <DeleteButton onClick={onDelete} label="Удалить поезд" />}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{train.departure}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>{train.fromStation}</div>
        </div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{train.durationLabel}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{train.arrival}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>{train.toStation}</div>
        </div>
      </div>
    </div>
  );
}
