import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'var(--color-hero-bg)',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }} aria-label="tutu">
        <Logo height={28} />
      </Link>
      <button
        type="button"
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '10px 20px',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Войти
      </button>
    </header>
  );
}
