import { Trash } from '@phosphor-icons/react';

export default function DeleteButton({ onClick, label = 'Удалить' }: { onClick?: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
        color: 'var(--color-text-secondary)',
      }}
    >
      <Trash size={16} />
    </button>
  );
}
