import { useState } from 'react';
import type { ChecklistFieldValues, ChecklistKey, ChecklistState } from '../mocks/types';
import { CHECKLIST_ORDER, CHECKLIST_LABELS } from '../lib/checklist';

interface ChecklistCardProps {
  checklistState: ChecklistState;
  fieldValues: ChecklistFieldValues;
  progress: number;
  canSubmit: boolean;
  onFieldChange: <K extends ChecklistKey>(key: K, value: ChecklistFieldValues[K]) => void;
  onSubmit: () => void;
}

function DestinationFields({
  onFieldChange,
  initialValue,
}: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: ChecklistFieldValues['destination'] }) {
  const [city, setCity] = useState(initialValue?.city ?? '');
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input placeholder="Город или направление" value={city} onChange={(e) => setCity(e.target.value)} />
      <button type="button" onClick={() => onFieldChange('destination', { city })}>
        Сохранить
      </button>
    </div>
  );
}

function OriginFields({
  onFieldChange,
  initialValue,
}: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: ChecklistFieldValues['origin'] }) {
  const [city, setCity] = useState(initialValue?.city ?? '');
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input placeholder="Город вылета или отправления" value={city} onChange={(e) => setCity(e.target.value)} />
      <button type="button" onClick={() => onFieldChange('origin', { city })}>
        Сохранить
      </button>
    </div>
  );
}

function TravelersFields({
  onFieldChange,
  initialValue,
}: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: ChecklistFieldValues['travelers'] }) {
  const [count, setCount] = useState(initialValue?.count ?? 1);
  const [composition, setComposition] = useState<'один' | 'с партнёром' | 'с семьёй' | 'компания друзей'>(
    initialValue?.composition ?? 'один',
  );
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
      <input
        type="number"
        min={1}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        aria-label="Число путешественников"
      />
      <select
        value={composition}
        onChange={(e) => setComposition(e.target.value as 'один' | 'с партнёром' | 'с семьёй' | 'компания друзей')}
      >
        <option value="один">Один</option>
        <option value="с партнёром">С партнёром</option>
        <option value="с семьёй">С семьёй</option>
        <option value="компания друзей">Компания друзей</option>
      </select>
      <button type="button" onClick={() => onFieldChange('travelers', { count, composition })}>
        Сохранить
      </button>
    </div>
  );
}

function DatesFields({
  onFieldChange,
  initialValue,
}: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: ChecklistFieldValues['dates'] }) {
  const [value, setValue] = useState(initialValue?.value ?? '');
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input placeholder="Например, через месяц или 15–20 сентября" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="button" onClick={() => onFieldChange('dates', { value })}>
        Сохранить
      </button>
    </div>
  );
}

function PreferencesFields({
  onFieldChange,
  initialValue,
}: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: ChecklistFieldValues['preferences'] }) {
  const [value, setValue] = useState(initialValue?.value ?? '');
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input placeholder="Например, бюджетно или с комфортом" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="button" onClick={() => onFieldChange('preferences', { value })}>
        Сохранить
      </button>
    </div>
  );
}

const FIELD_COMPONENTS: Record<
  ChecklistKey,
  (props: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: unknown }) => JSX.Element
> = {
  destination: DestinationFields as (
    props: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: unknown },
  ) => JSX.Element,
  origin: OriginFields as (
    props: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: unknown },
  ) => JSX.Element,
  travelers: TravelersFields as (
    props: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: unknown },
  ) => JSX.Element,
  dates: DatesFields as (
    props: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: unknown },
  ) => JSX.Element,
  preferences: PreferencesFields as (
    props: Pick<ChecklistCardProps, 'onFieldChange'> & { initialValue: unknown },
  ) => JSX.Element,
};

export default function ChecklistCard({
  checklistState,
  fieldValues,
  progress,
  canSubmit,
  onFieldChange,
  onSubmit,
}: ChecklistCardProps) {
  const [expandedKey, setExpandedKey] = useState<ChecklistKey | null>(null);

  return (
    <div
      style={{
        background: 'var(--color-primary-tint)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          {progress}/{CHECKLIST_ORDER.length}
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Чек-лист поездки
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Собираем ваш вариант</div>
        </div>
      </div>

      {CHECKLIST_ORDER.map((key) => {
        const label = CHECKLIST_LABELS[key];
        const done = checklistState[key];
        const isExpanded = expandedKey === key;
        const FieldComponent = FIELD_COMPONENTS[key];
        return (
          <div key={key} style={{ borderTop: '1px solid var(--color-border)', padding: '12px 0' }}>
            <button
              type="button"
              onClick={() => setExpandedKey(isExpanded ? null : key)}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: done ? 'var(--color-success)' : 'transparent',
                  border: done ? 'none' : '2px solid var(--color-border)',
                  flexShrink: 0,
                }}
              />
              <span>
                <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>{label.title}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{label.description}</div>
              </span>
            </button>
            {isExpanded && <FieldComponent onFieldChange={onFieldChange} initialValue={fieldValues[key]} />}
          </div>
        );
      })}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        style={{
          width: '100%',
          marginTop: 16,
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: canSubmit ? 'var(--color-primary)' : 'var(--color-border)',
          color: canSubmit ? 'var(--color-surface)' : 'var(--color-text-secondary)',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        Спланировать путешествие
      </button>
    </div>
  );
}
