# trip-planner backend

FastAPI-бэкенд для хакатона Туту MCP. Связывает React-фронт (`web/`) с MCP Туту
(read-only поиск) и LLM bothub (объяснение выбора).

## Запуск

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # или .venv\Scripts\activate на Windows
pip install -r requirements.txt
cp .env.example .env                                 # вписать BOTHUB_KEY
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API-контракт (для фронта)

Бэкенд слушает на `/api/*`. nginx на проде проксирует `/api/` → `127.0.0.1:8000/`
(без переписывания пути), в dev Vite проксирует `/api` → `http://localhost:8000`.

### `POST /api/session`

Ответ: `{"session_id": "..."}`.

### `POST /api/chat`

Запрос: `{"session_id": "..." | null, "message": "текст"}`.

Ответ: `{"reply": "текст в чат", "state": {...}}`.

### `POST /api/select-seat`

Запрос: `{"session_id": "...", "car_number": "5", "seat_numbers": ["21", "22"]}`.

Ответ: `{"reply": "...", "state": {...}}`.

## `state` — что фронт рендерит

```json
{
  "stage": "greeting|clarifying|results|seatmap|checkout|done|error",
  "trip": {"origin", "destination", "departure_date", "passengers", "preferences"},
  "offers": [
    {"offer_id", "transport", "carrier", "train_number",
     "departure_at", "arrival_at", "duration_min", "price", "currency",
     "seat_categories": {"COMPARTMENT": 6194.76}, "review_rating"}
  ],
  "selected_offer": null | {то же, что элемент offers},
  "seatmap": null | {"cars": [{"car_number", "car_type", "seats": [
      {"number", "type", "compartment_number", "deck", "gender", "level",
       "distance_to_nearest_wc_px"}
    ]}], "total_free"},
  "checkout": null | {"url", "kind"},
  "explanation": null | "текст"
}
```

`stage` — на каком шаге сценарий, фронт по нему выбирает экран/блок:

- `clarifying` — задать пользователю уточняющий вопрос.
- `results` — показать `offers` списком карточек.
- `seatmap` — показать схему вагона `seatmap`.
- `checkout` — показать `explanation` + ссылку `checkout.url`.

Сценарий: чат → `clarifying` (пока не хватает параметров) → `results` (выбор поезда)
→ `seatmap` (выбор места) → `select-seat` → `checkout` (объяснение + ссылка).

## Деградация

- MCP недоступен → `reply` с текстом «поиск недоступен», `stage` не двигается.
- bothub недоступен → объяснение заменяется шаблоном, поиск и checkout работают.

## Тесты

```bash
python -m pytest
```
