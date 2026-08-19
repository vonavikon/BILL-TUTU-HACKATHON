import { Plus } from '@phosphor-icons/react';

export default function AddItemRow({ label, onAdd }: { label: string; onAdd?: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 16,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 15 }}>{label}</span>
      <button
        type="button"
        onClick={onAdd}
        aria-label={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          flexShrink: 0,
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: '50%',
          color: 'var(--color-text)',
        }}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
