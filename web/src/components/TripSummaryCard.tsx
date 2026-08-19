import type { ReactNode } from 'react';
import { CalendarBlank, MapPin, PlayCircle, Sparkle, UsersThree } from '@phosphor-icons/react';

interface TripSummaryCardProps {
  title: string;
  origin?: string;
  dates?: string;
  travelers?: string;
  preferences?: string;
}

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ display: 'flex', color: 'var(--color-text-secondary)' }}>{icon}</span>
      <span style={{ fontSize: 14 }}>{children}</span>
    </div>
  );
}

export default function TripSummaryCard({ title, origin, dates, travelers, preferences }: TripSummaryCardProps) {
  return (
    <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0 }}>
        <div
          aria-hidden
          style={{
            width: 140,
            height: 140,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(160deg, #1e3a8a 0%, #0ea5e9 45%, #67e8f9 75%, #fef9c3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlayCircle size={40} color="#ffffff" weight="fill" />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 24, margin: '0 0 12px' }}>{title}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
          {origin && <MetaItem icon={<MapPin size={18} />}>из {origin}</MetaItem>}
          {dates && <MetaItem icon={<CalendarBlank size={18} />}>{dates}</MetaItem>}
          {travelers && <MetaItem icon={<UsersThree size={18} />}>{travelers}</MetaItem>}
          {preferences && <MetaItem icon={<Sparkle size={18} />}>{preferences}</MetaItem>}
        </div>
      </div>
    </div>
  );
}
