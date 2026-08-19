import { ArrowLeft } from '@phosphor-icons/react';

export default function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Назад"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          flexShrink: 0,
          background: 'var(--color-surface)',
          border: 'none',
          borderRadius: '50%',
          color: 'var(--color-text)',
        }}
      >
        <ArrowLeft size={18} />
      </button>
      <h2 style={{ fontSize: 20, margin: 0 }}>{title}</h2>
    </div>
  );
}
