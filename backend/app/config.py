"""Конфиг из переменных окружения (локально — из .env)."""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    # .env лежит в backend/ (родитель пакета app/), а не в CWD —
    # иначе при запуске из другой директории ключ не находится.
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:  # на проде .env не нужен, значения кладутся в systemd
    pass

BOTHUB_KEY = os.getenv("BOTHUB_KEY", "").strip()
BOTHUB_MODEL = os.getenv("BOTHUB_MODEL", "deepseek-v4-pro")
BOTHUB_URL = os.getenv(
    "BOTHUB_URL", "https://openai.bothub.chat/v1/chat/completions"
)
TUTU_MCP_URL = os.getenv("TUTU_MCP_URL", "https://mcp.tutu.ru/mcp")
