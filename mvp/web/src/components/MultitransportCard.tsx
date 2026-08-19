import { Airplane, Bus, Train, TrainRegional, type Icon } from '@phosphor-icons/react';
import type { MultitransportOption } from '../mocks/cards';
import Pill from './Pill';

const MODE_ICON: Record<MultitransportOption['mode'], Icon> = {
  avia: Airplane,
  rail: Train,
  bus: Bus,
  etrain: TrainRegional,
};

export default function MultitransportCard({
  options,
  minPrice,
  currency,
}: {
  options: MultitransportOption[];
  minPrice: number;
  currency: string;
}) {
  return (
    <div style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      {options.map((option, index) => {
        const ModeIcon = MODE_ICON[option.mode];
        return (
        <div key={option.mode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ModeIcon size={16} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {option.modeLabel}
            </span>
            {option.badge && <Pill kind="positive">{option.badge}</Pill>}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: index < options.length - 1 ? 10 : 0 }}>
            <span style={{ fontSize: 13 }}>
              {option.departure} → {option.arrival}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{option.durationLabel}</span>
          </div>
          {index < options.length - 1 && <div style={{ height: 1, background: 'var(--color-border)', margin: '10px 0' }} />}
        </div>
        );
      })}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '10px 0' }} />
      <div style={{ fontWeight: 700, fontSize: 16 }}>
        от {minPrice.toLocaleString('ru-RU')} {currency}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>минимальная цена по всем видам</div>
    </div>
  );
}
