"""Клиент bothub (OpenAI-совместимый endpoint)."""
import httpx

from . import config


class LLMError(Exception):
    """bothub недоступен или вернул пустой ответ."""


class BothubLLM:
    def __init__(self, key: str | None = None, model: str | None = None):
        self.key = key or config.BOTHUB_KEY
        self.model = model or config.BOTHUB_MODEL
        self.url = config.BOTHUB_URL
        self._client = httpx.AsyncClient(timeout=120.0)

    async def complete(self, messages: list[dict], max_tokens: int = 800) -> str:
        """Возвращает text ответа модели. reasoning_effort=none, чтобы reasoning
        не съедал max_tokens впустую (deepseek-v4-pro и так отдаёт content)."""
        if not self.key:
            raise LLMError("BOTHUB_KEY не задан")
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "reasoning_effort": "none",
            "temperature": 0,
        }
        try:
            r = await self._client.post(
                self.url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.key}",
                    "Content-Type": "application/json",
                },
            )
            r.raise_for_status()
            data = r.json()
        except httpx.HTTPError as e:
            raise LLMError(f"bothub сеть: {e}") from e
        try:
            content = data["choices"][0]["message"]["content"] or ""
        except (KeyError, IndexError):
            raise LLMError(f"bothub: пустой ответ {data}") from None
        return content.strip()

    async def aclose(self) -> None:
        await self._client.aclose()
