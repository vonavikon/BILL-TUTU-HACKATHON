import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Star } from '@phosphor-icons/react';
import Header from '../components/Header';
import ChatPanel from '../components/ChatPanel';
import StageStepper from '../components/StageStepper';
import TripSummaryCard from '../components/TripSummaryCard';
import Markdown from '../components/Markdown';
import { useTripState } from '../state/TripContext';
import type { BackendHotel, BackendOffer, BackendSeat, BackendSeatmap, BackendVideo } from '../lib/api';

function hhmm(iso: string): string {
  return iso.length >= 16 ? iso.slice(11, 16) : iso;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
}

function seatTypeLabel(type: string): string {
  const t = type.toUpperCase();
  if (t.startsWith('SIDE_LOWER')) return 'бок. нижнее';
  if (t.startsWith('SIDE_UPPER')) return 'бок. верхнее';
  if (t.startsWith('LOWER')) return 'нижнее';
  if (t.startsWith('UPPER')) return 'верхнее';
  if (t.startsWith('SEDENTARY')) return 'сидячее';
  return type;
}

function transportLabel(transport: string): string {
  return transport === 'avia' ? 'Самолёт' : 'Поезд';
}

export default function TripPlan() {
  const location = useLocation();
  const { messages, backendState, loading, status, sendMessage, selectSeat } = useTripState();
  const seededRef = useRef(false);

  const [carIndex, setCarIndex] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const firstMessage = (location.state as { firstMessage?: string } | null)?.firstMessage;
    if (firstMessage && !seededRef.current) {
      seededRef.current = true;
      sendMessage(firstMessage);
    }
  }, [location.state, sendMessage]);

  const state = backendState;
  const trip = state?.trip;
  const passengers = trip?.passengers ?? 1;

  function toggleSeat(number: string) {
    setSelectedSeats((prev) => {
      if (prev.includes(number)) return prev.filter((n) => n !== number);
      if (prev.length >= passengers) return prev;
      return [...prev, number];
    });
  }

  function handleCarChange(idx: number) {
    setCarIndex(idx);
    setSelectedSeats([]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '35% 65%', overflow: 'hidden' }}>
        <div style={{ borderRight: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <ChatPanel messages={messages} status={status} onSend={sendMessage} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-panel-bg)' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div
              className="animate-in"
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: 20,
                marginBottom: 20,
              }}
            >
              <StageStepper state={state} />
            </div>

            {trip && trip.origin && trip.destination && (
              <div className="animate-in" style={{ marginBottom: 20 }}>
                <TripSummaryCard
                  title={`${trip.origin} - ${trip.destination}`}
                  origin={trip.origin}
                  dates={trip.departure_date ?? undefined}
                  travelers={`${passengers} ${passengers === 1 ? 'пассажир' : 'пассажиров'}`}
                />
              </div>
            )}

            {state?.stage === 'results' && (
              <div className="animate-in">
                <OfferList offers={state.offers} onSelect={sendMessage} />
              </div>
            )}

            {state?.stage === 'seatmap' && state.seatmap && state.selected_offer && (
              <div className="animate-in">
                <button
                  type="button"
                  onClick={() => sendMessage('назад')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '6px 2px',
                    marginBottom: 12,
                  }}
                >
                  <ArrowLeft size={16} weight="bold" />
                  Назад к вариантам
                </button>
                <SeatPicker
                  seatmap={state.seatmap}
                  trainNumber={state.selected_offer.train_number}
                  carIndex={carIndex}
                  onCarChange={handleCarChange}
                  selectedSeats={selectedSeats}
                  onToggleSeat={toggleSeat}
                  onConfirm={() => {
                    const car = state.seatmap?.cars[carIndex];
                    if (car && selectedSeats.length > 0) selectSeat(car.car_number, selectedSeats);
                  }}
                  busy={loading}
                />
              </div>
            )}

            {state?.stage === 'checkout' && state.checkout && (
              <div
                className="animate-in"
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Всё готово</div>
                {state.explanation && (
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                    <Markdown text={state.explanation} />
                  </div>
                )}
                <a
                  href={state.checkout.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    background: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Перейти к покупке
                </a>
              </div>
            )}

            {state?.hotels && state.hotels.length > 0 && (
              <div className="animate-in" style={{ marginTop: 20 }}>
                <HotelList hotels={state.hotels} onSelect={sendMessage} />
              </div>
            )}

            {state?.videos && state.videos.length > 0 && (
              <div className="animate-in" style={{ marginTop: 20 }}>
                <VideoList videos={state.videos} />
              </div>
            )}

            {(!state || state.stage === 'greeting' || state.stage === 'clarifying') && (
              <div className="animate-in" style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Опишите поездку в чате: откуда, куда, на какую дату и сколько человек. Я подберу
                варианты и объясню, почему выбрал именно их.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferList({ offers, onSelect }: { offers: BackendOffer[]; onSelect: (text: string) => void }) {
  if (offers.length === 0) {
    return <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Вариантов не нашлось.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {offers.map((offer, index) => {
        const label = transportLabel(offer.transport);
        const number = offer.train_number || offer.carrier || `${index + 1}`;
        return (
          <div
            key={offer.offer_id || `${label}-${index}`}
            className="animate-in"
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              padding: 20,
              animationDelay: `${index * 60}ms`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {label} {number}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {offer.price} {offer.currency}
              </div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              {hhmm(offer.departure_at)} - {hhmm(offer.arrival_at)} · {fmtDuration(offer.duration_min)}
            </div>
            {offer.transport !== 'avia' && Object.keys(offer.seat_categories).length > 0 && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                {Object.entries(offer.seat_categories)
                  .map(([cat, price]) => `${cat}: от ${price} ₽`)
                  .join(' · ')}
              </div>
            )}
            <button
              type="button"
              onClick={() => onSelect(`${label} ${number}`)}
              style={{
                marginTop: 12,
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Выбрать
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HotelList({ hotels, onSelect }: { hotels: BackendHotel[]; onSelect: (text: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {hotels.map((h, index) => (
        <div
          key={h.hotel_id || h.name}
          className="animate-in"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: 20,
            animationDelay: `${index * 60}ms`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{h.name}</div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>
              {h.price} {h.currency}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <span style={{ color: '#f5a623', display: 'inline-flex', gap: 1 }}>
              {Array.from({ length: h.stars }).map((_, i) => (
                <Star key={i} size={13} weight="fill" />
              ))}
            </span>
            {h.rating != null && <span>{h.rating.toFixed(1)}</span>}
            {h.room_name && <span>· {h.room_name}</span>}
            {h.free_cancellation && <span>· бесплатная отмена</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>за проживание</div>
          {h.checkout_url ? (
            <a
              href={h.checkout_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 12,
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Забронировать
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(`отель ${index + 1}`)}
              style={{
                marginTop: 12,
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Забронировать
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function VideoList({ videos }: { videos: BackendVideo[] }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Видео о направлении</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {videos.map((v, index) => (
          <a
            key={v.video_id || v.title}
            href={v.url}
            target="_blank"
            rel="noreferrer"
            className="animate-in"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
              animationDelay: `${index * 60}ms`,
            }}
          >
            <div
              aria-hidden
              style={{
                height: 96,
                background: 'linear-gradient(135deg, #0d0b68 0%, #6f5df6 60%, #a5b4fc 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayCircle size={34} color="#ffffff" weight="fill" />
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{v.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{v.channel}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function SeatPicker({
  seatmap,
  trainNumber,
  carIndex,
  onCarChange,
  selectedSeats,
  onToggleSeat,
  onConfirm,
  busy,
}: {
  seatmap: BackendSeatmap;
  trainNumber: string;
  carIndex: number;
  onCarChange: (idx: number) => void;
  selectedSeats: string[];
  onToggleSeat: (number: string) => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const cars = seatmap.cars;
  const car = cars[carIndex];

  if (cars.length === 0) {
    return <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Схема вагона недоступна.</div>;
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: 20,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Поезд {trainNumber}: выбор места</div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {cars.map((c, i) => (
          <button
            key={c.car_number}
            type="button"
            onClick={() => onCarChange(i)}
            style={{
              background: i === carIndex ? 'var(--color-primary)' : 'var(--color-surface)',
              color: i === carIndex ? 'var(--color-on-primary)' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              fontSize: 13,
            }}
          >
            Вагон {c.car_number}
          </button>
        ))}
      </div>

      {car && (
        <>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            {car.car_type} · свободно {car.seats.length} мест
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {car.seats.map((seat) => (
              <SeatButton
                key={seat.number}
                seat={seat}
                selected={selectedSeats.includes(seat.number)}
                onClick={() => onToggleSeat(seat.number)}
              />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        disabled={selectedSeats.length === 0 || busy}
        onClick={onConfirm}
        style={{
          marginTop: 20,
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {busy ? 'Оформляю…' : `Подтвердить ${selectedSeats.length > 0 ? `места ${selectedSeats.join(', ')}` : ''}`}
      </button>
    </div>
  );
}

function SeatButton({
  seat,
  selected,
  onClick,
}: {
  seat: BackendSeat;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={seatTypeLabel(seat.type)}
      style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-sm)',
        background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
        color: selected ? 'var(--color-on-primary)' : 'var(--color-text)',
        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600 }}>{seat.number}</span>
      <span style={{ fontSize: 9, opacity: 0.8 }}>{seatTypeLabel(seat.type)}</span>
    </button>
  );
}
