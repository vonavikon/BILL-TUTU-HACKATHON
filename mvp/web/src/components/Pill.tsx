import type { ReactNode } from 'react';

type PillKind = 'default' | 'positive' | 'primary';

const KIND_STYLES: Record<PillKind, { background: string; color: string; border?: string }> = {
  default: { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
  positive: { background: 'rgba(72, 162, 43, 0.12)', color: 'var(--color-success)' },
  primary: { background: 'var(--color-primary)', color: 'var(--color-on-primary)' },
};

export default function Pill({ children, kind = 'default' }: { children: ReactNode; kind?: PillKind }) {
  const kindStyle = KIND_STYLES[kind];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: kind === 'primary' ? 600 : 400,
        whiteSpace: 'nowrap',
        ...kindStyle,
      }}
    >
      {children}
    </span>
  );
}
