"""Тонкий MCP-клиент к mcp.tutu.ru/mcp.

Сервер работает в stateless streamable HTTP режиме: каждый вызов — независимый
POST с JSON-RPC, ответ приходит JSON (не SSE), без сессий и авторизации.
Результат tools/call лежит в result.content[0].text как JSON-строка, при
isError=true — это текст ошибки.
"""
import json

import httpx

from . import config


class MCPError(Exception):
    """Ошибка вызова инструмента (isError=true или сеть)."""


class TutuMCP:
    def __init__(self, url: str | None = None):
        self.url = url or config.TUTU_MCP_URL
        self._id = 0
        self._client = httpx.AsyncClient(timeout=60.0)
        self._tools: list[dict] | None = None

    def _next_id(self) -> int:
        self._id += 1
        return self._id

    async def _post(self, payload: dict) -> dict:
        try:
            r = await self._client.post(
                self.url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/event-stream",
                },
            )
            r.raise_for_status()
            return r.json()
        except httpx.HTTPError as e:
            raise MCPError(f"сеть: {e}") from e

    async def initialize(self) -> dict:
        payload = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "tutu-backend", "version": "0.1.0"},
            },
        }
        return await self._post(payload)

    async def list_tools(self) -> list[dict]:
        payload = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "tools/list",
            "params": {},
        }
        data = await self._post(payload)
        self._tools = data["result"]["tools"]
        return self._tools

    @property
    def tools(self) -> list[dict]:
        return self._tools or []

    async def call_tool(self, name: str, arguments: dict) -> dict:
        """Вызывает инструмент и возвращает распарсенный structured content."""
        payload = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments},
        }
        data = await self._post(payload)
        result = data.get("result")
        if result is None:
            raise MCPError(f"{name}: нет result (error={data.get('error')})")
        if result.get("isError"):
            raise MCPError(f"{name}: {self._text(result)}")
        text = self._text(result)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # редкий случай: инструмент вернул не JSON, а голый текст
            return {"text": text}

    @staticmethod
    def _text(result: dict) -> str:
        content = result.get("content") or []
        parts = [c.get("text", "") for c in content if c.get("type") == "text"]
        return "\n".join(parts)

    async def aclose(self) -> None:
        await self._client.aclose()
