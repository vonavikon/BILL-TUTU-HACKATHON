"""Извлечение параметров поездки из сообщения пользователя через LLM."""
import json
import re
from datetime import date

from .guard import HARDEN, MESSAGE_MAX, clean_text, sanitize_trip

_SYSTEM = (
    "Ты извлекаешь параметры поездки по железной дороге из сообщения пользователя. "
    "Отвечай только валидным JSON, без пояснений, без markdown-блоков. " + HARDEN
)


def _extract_json(text: str) -> dict:
    """Парсит JSON из ответа модели. При неудаче возвращает {} — никогда не
    бросает исключение: невалидный вывод модели не должен ронять запрос."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass
    return {}


async def extract_trip(llm, message: str, current: dict) -> dict:
    today = date.today().isoformat()
    message = clean_text(message, MESSAGE_MAX)
    prompt = (
        f"Сегодня {today}.\n"
        f"Текущие параметры поездки: {json.dumps(current, ensure_ascii=False)}\n"
        f"Сообщение пользователя: «{message}»\n\n"
        "Извлеки параметры поездки. Объедини с текущими: новые значения перезаписывают "
        "старые, не упомянутые остаются. Даты приводи к формату YYYY-MM-DD (завтра, "
        "послезавтра, «21 августа» — считай от сегодня).\n"
        "Верни JSON строго такой формы:\n"
        '{"origin": str|null, "destination": str|null, "departure_date": "YYYY-MM-DD"|null, '
        '"passengers": int, "preferences": {'
        '"seat_category": "COMPARTMENT|RESERVED_SEAT|LUX|SEDENTARY|SOFT|SHARED"|null, '
        '"max_price": int|null, "arrive_by": "HH:MM"|null, "cheapest": bool}}'
    )
    content = await llm.complete(
        [{"role": "system", "content": _SYSTEM}, {"role": "user", "content": prompt}],
        max_tokens=300,
    )
    return sanitize_trip(_extract_json(content))
