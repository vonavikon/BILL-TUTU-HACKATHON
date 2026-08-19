import { useState } from 'react';
import type { AlternativeOption } from '../mocks/alternatives';
import OptionRow from './OptionRow';
import PanelHeader from './PanelHeader';

type SortOrder = 'default' | 'price';

interface ChangePanelProps<T> {
  title: string;
  options: AlternativeOption<T>[];
  selectedId: string | string[];
  onSelect: (option: AlternativeOption<T>) => void;
  onClose: () => void;
}

export default function ChangePanel<T>({ title, options, selectedId, onSelect, onClose }: ChangePanelProps<T>) {
  const selectedIds = Array.isArray(selectedId) ? selectedId : [selectedId];
  const [sort, setSort] = useState<SortOrder>('default');

  const sortedOptions = sort === 'price' ? [...options].sort((a, b) => a.price - b.price) : options;

  return (
    <div>
      <PanelHeader title={title} onClose={onClose} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setSort('default')}
          style={{
            background: sort === 'default' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: sort === 'default' ? 'var(--color-on-primary)' : 'var(--color-text)',
            border: 'none',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Рекомендуемые
        </button>
        <button
          type="button"
          onClick={() => setSort('price')}
          style={{
            background: sort === 'price' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: sort === 'price' ? 'var(--color-on-primary)' : 'var(--color-text)',
            border: 'none',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Сначала дешёвые
        </button>
      </div>

      {sortedOptions.map((option) => (
        <OptionRow
          key={option.id}
          title={option.title}
          meta={option.meta}
          price={option.price}
          currency={option.currency}
          selected={selectedIds.includes(option.id)}
          onSelect={() => onSelect(option)}
        />
      ))}
    </div>
  );
}
