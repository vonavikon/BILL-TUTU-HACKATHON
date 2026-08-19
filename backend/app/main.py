"""FastAPI-приложение: единый вход /api/chat + /api/select-seat + /api/session.

Помимо JSON-эндпоинтов есть /stream-варианты: отдают NDJSON-поток из событий
{"type":"status","text":...} и финального {"type":"result","reply":...,"state":...}.
"""
import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .agent.orchestrate import Orchestrator
from .llm import BothubLLM
from .mcp import MCPError, TutuMCP


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mcp = TutuMCP()
    app.state.llm = BothubLLM()
    try:
        await app.state.mcp.initialize()
        await app.state.mcp.list_tools()
    except MCPError:
        pass  # деградация обрабатывается на уровне запросов
    app.state.orchestrator = Orchestrator(app.state.mcp, app.state.llm)
    yield
    await app.state.mcp.aclose()
    await app.state.llm.aclose()


app = FastAPI(title="trip-planner backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str


class SeatRequest(BaseModel):
    session_id: str
    car_number: str | None = None
    seat_numbers: list[str] = []


@app.post("/api/session")
async def create_session():
    sid = await app.state.orchestrator.new_session()
    return {"session_id": sid}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    orch: Orchestrator = app.state.orchestrator
    if not req.session_id:
        req.session_id = await orch.new_session()
    reply, state = await orch.handle_message(req.session_id, req.message)
    return {"reply": reply, "state": state.model_dump()}


@app.post("/api/select-seat")
async def select_seat(req: SeatRequest):
    orch: Orchestrator = app.state.orchestrator
    reply, state = await orch.select_seat(req.session_id, req.car_number, req.seat_numbers)
    return {"reply": reply, "state": state.model_dump()}


# ---- стриминг ----

async def _ndjson_stream(producer):
    """Прокидывает NDJSON-поток: producer(emit) шлёт dict-объекты, emit сериализует их.

    producer получает emit(dict) и возвращает управление, когда результат готов.
    Завершение — sentinel None в очереди; заголовок X-Accel-Buffering отключает
    буферизацию на проксирующем nginx даже при включённом proxy_buffering.
    """
    queue: asyncio.Queue = asyncio.Queue()

    async def emit(obj: dict) -> None:
        await queue.put(json.dumps(obj, ensure_ascii=False))

    async def worker() -> None:
        try:
            await producer(emit)
        except Exception as exc:  # noqa: BLE001 — отдаём ошибку в поток, не роняем запрос
            await emit({"type": "error", "text": f"Внутренняя ошибка: {exc}"})
        await queue.put(None)

    task = asyncio.create_task(worker())

    async def gen():
        try:
            while True:
                item = await queue.get()
                if item is None:
                    break
                yield item + "\n"
        finally:
            task.cancel()

    return StreamingResponse(
        gen(),
        media_type="application/x-ndjson",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    orch: Orchestrator = app.state.orchestrator
    sid = req.session_id or await orch.new_session()
    message = req.message

    async def producer(emit):
        async def on_status(text: str) -> None:
            await emit({"type": "status", "text": text})

        reply, state = await orch.handle_message(sid, message, on_status=on_status)
        await emit({"type": "result", "reply": reply, "state": state.model_dump()})

    return await _ndjson_stream(producer)


@app.post("/api/select-seat/stream")
async def select_seat_stream(req: SeatRequest):
    orch: Orchestrator = app.state.orchestrator

    async def producer(emit):
        async def on_status(text: str) -> None:
            await emit({"type": "status", "text": text})

        reply, state = await orch.select_seat(
            req.session_id, req.car_number, req.seat_numbers, on_status=on_status
        )
        await emit({"type": "result", "reply": reply, "state": state.model_dump()})

    return await _ndjson_stream(producer)
