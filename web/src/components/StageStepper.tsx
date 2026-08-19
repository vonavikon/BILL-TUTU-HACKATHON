import { useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { BackendState } from '../lib/api';

// Канон из спеки web-flow-design: четыре пункта по порядку. Каждый — раскрываемая
// строка с кружком. Сверху общий прогресс «N/4».
interface Step {
  key: string;
  label: string;
  done: boolean;
  active: boolean;
  detail: string;
}

function computeSteps(state: BackendState | null): Step[] {
  const trip = state?.trip;
  const routeDone = !!(trip?.origin && trip?.destination && trip?.departure_date);
  const trainDone = !!state?.selected_offer;
  const paxDone = !!trip?.passengers_explicit;
  const prefDone = !!(trip?.preferences && Object.keys(trip.preferences).length > 0) || !!state?.checkout;

  const doneFlags = [routeDone, trainDone, paxDone, prefDone];
  const firstOpen = doneFlags.findIndex((d) => !d);
  const activeIndex = firstOpen === -1 ? 3 : firstOpen;

  const route = trip
    ? [trip.origin, trip.destination].filter(Boolean).join(' - ') + (trip.departure_date ? ` · ${trip.departure_date}` : '')
    : '';

  return [
    {
      key: 'route',
      label: 'Маршрут и дата',
      done: routeDone,
      active: activeIndex === 0,
      detail: route || 'Откуда, куда и на какую дату едем.',
    },
    {
      key: 'train',
      label: 'Поезд и тариф',
      done: trainDone,
      active: activeIndex === 1,
      detail: state?.selected_offer
        ? `${state.selected_offer.train_number} · ${state.selected_offer.price} ${state.selected_offer.currency}`
        : 'Какой вариант берём и в каком вагоне.',
    },
    {
      key: 'pax',
      label: 'Пассажиры',
      done: paxDone,
      active: activeIndex === 2,
      detail: trip?.passengers_explicit ? `${trip.passengers} человек` : 'Сколько вас едет.',
    },
    {
      key: 'pref',
      label: 'Предпочтения места',
      done: prefDone,
      active: activeIndex === 3,
      detail: trip?.preferences && Object.keys(trip.preferences).length > 0
        ? Object.values(trip.preferences).filter(Boolean).join(', ')
        : 'Ярус, близость к туалету, пол купе, «еду с ребёнком».',
    },
  ];
}

export default function StageStepper({ state }: { state: BackendState | null }) {
  const steps = computeSteps(state);
  const [open, setOpen] = useState<string | null>(null);
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div
        className="progress-ring"
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          background: `conic-gradient(var(--color-primary) ${(doneCount / 4) * 360}deg, var(--color-border) 0deg)`,
        }}
        aria-label={`Выполнено ${doneCount} из 4`}
      >
        <span className="progress-ring-num">
          {doneCount}/4
        </span>
      </div>

      <div className="stepper" style={{ flex: 1, minWidth: 0 }}>
        {steps.map((step) => {
          const isOpen = open === step.key;
          return (
            <div key={step.key} className="stepper-row" style={{ marginBottom: 4 }}>
              <div className="stepper-track">
                <span className={`stepper-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                  {step.done ? <Check size={12} weight="bold" /> : null}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : step.key)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  background: 'transparent',
                  border: 'none',
                  padding: '6px 2px',
                  textAlign: 'left',
                }}
              >
                <span className={`stepper-label ${step.active ? 'active' : ''} ${step.done ? 'done' : ''}`}>
                  {step.label}
                </span>
                <CaretDown
                  size={14}
                  weight="bold"
                  color="var(--color-text-secondary)"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
              {isOpen && (
                <div className="stepper-detail" style={{ padding: '4px 0 10px 30px' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {step.detail}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
