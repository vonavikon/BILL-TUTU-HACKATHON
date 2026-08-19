import { Star } from '@phosphor-icons/react';

export default function StarRating({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} size={size} weight="fill" />
      ))}
    </span>
  );
}
