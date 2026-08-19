import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Buildings, Microphone, Paperclip } from '@phosphor-icons/react';
import Header from '../components/Header';
import heroPlane from '../assets/hero-plane.png';

const EXAMPLE_CHIPS = ['Сочи на майские', 'Питер на выходные', 'Куда-нибудь с семьёй', 'Командировка по работе'];

// crypto.randomUUID доступен только в secure-контексте (HTTPS); прод сервер — по HTTP,
// поэтому id поездки собираем без него.
function makeTripId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function startTrip(text: string) {
    if (!text.trim()) return;
    navigate(`/trip/${makeTripId()}`, { state: { firstMessage: text.trim() } });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTrip(query);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      startTrip(query);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <section
        style={{
          background: 'var(--color-hero-bg)',
          color: 'var(--color-on-hero)',
          padding: '64px 32px',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 56,
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ flex: '1 1 480px', maxWidth: 620 }}>
            <h1 style={{ fontSize: 44, lineHeight: 1.15, margin: '0 0 16px' }}>Куда едем в этот раз?</h1>
            <p style={{ fontSize: 16, opacity: 0.75, margin: '0 0 24px' }}>
              Живые цены сразу по всем видам транспорта и жилью — агент объяснит, почему выбрал именно так
            </p>

            <form
              onSubmit={handleSubmit}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 16,
              }}
            >
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Куда хотите поехать?"
                aria-label="Куда хотите поехать?"
                rows={2}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: 16,
                  fontFamily: 'inherit',
                  color: 'var(--color-text)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <button
                  type="button"
                  aria-label="Прикрепить файл"
                  style={{ display: 'flex', background: 'none', border: 'none', color: 'var(--color-text-secondary)', padding: 8 }}
                >
                  <Paperclip size={18} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    aria-label="Голосовой ввод"
                    style={{ display: 'flex', background: 'none', border: 'none', color: 'var(--color-text-secondary)', padding: 8 }}
                  >
                    <Microphone size={18} />
                  </button>
                  <button
                    type="submit"
                    aria-label="Отправить запрос"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                    }}
                  >
                    <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              </div>
            </form>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => startTrip(chip)}
                  style={{
                    background: 'var(--color-on-hero-muted)',
                    color: 'var(--color-on-hero)',
                    border: '1px solid var(--color-on-hero-border)',
                    borderRadius: 999,
                    padding: '8px 14px',
                    fontSize: 14,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, opacity: 0.75 }}>Совет: ищете только отель?</span>
              <a
                href="#"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--color-on-hero-muted)',
                  color: 'var(--color-on-hero)',
                  border: '1px solid var(--color-on-hero-border)',
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                <Buildings size={16} />
                Отели Туту
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          <div style={{ flex: '1 1 400px', maxWidth: 460 }}>
            <img
              src={heroPlane}
              alt=""
              aria-hidden
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 24px 40px rgba(0, 0, 0, 0.35))',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
