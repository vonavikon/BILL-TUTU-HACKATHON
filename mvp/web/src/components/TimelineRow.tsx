import type { ReactNode } from 'react';

interface TimelineRowProps {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  showLine?: boolean;
  children: ReactNode;
}

export default function TimelineRow({ icon, label, sublabel, showLine = true, children }: TimelineRowProps) {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-hero-bg)',
            color: 'var(--color-on-hero)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {icon}
        </div>
        {showLine && <div style={{ width: 2, flex: 1, background: 'var(--color-border)', marginTop: 8, minHeight: 24 }} />}
      </div>
      <div style={{ width: 96, flexShrink: 0, paddingTop: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{sublabel}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: showLine ? 24 : 0 }}>{children}</div>
    </div>
  );
}
