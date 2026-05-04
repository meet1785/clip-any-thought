#!/usr/bin/env python3
"""Run a tiny Anthropic-compatible proxy in front of NVIDIA's chat API.

Claude Code can point `ANTHROPIC_BASE_URL` at this proxy. The proxy strips
Anthropic-specific fields NVIDIA does not understand, forwards the request to
NVIDIA's OpenAI-compatible `/chat/completions` endpoint, and maps the response
back into Claude Code's expected message shape.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
NVIDIA_API_BASE_URL = os.environ.get("NVIDIA_API_BASE_URL", "https://integrate.api.nvidia.com/v1").rstrip("/")
DEFAULT_MODEL = os.environ.get("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
HOST = os.environ.get("CLAUDE_NIM_PROXY_HOST", "127.0.0.1")
PORT = int(os.environ.get("CLAUDE_NIM_PROXY_PORT", "4000"))

CLAUDE_MODEL_OPTIONS = [
    "sonnet",
    "opus",
    "haiku",
    "claude-sonnet-4-6",
    "claude-sonnet-4-20250514",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-20250514",
    "claude-haiku-4-20250514",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
]


def flatten_content(content) -> str:
    if isinstance(content, str):
        return content

    if not isinstance(content, list):
        return str(content or "")

    parts: list[str] = []
    for block in content:
        if not isinstance(block, dict):
            continue
        block_type = block.get("type")
        if block_type in {"text", "input_text"}:
            text = block.get("text")
            if text:
                parts.append(str(text))
        elif block_type == "tool_result":
            tool_text = block.get("content")
            if tool_text:
                parts.append(str(tool_text))
        elif block_type == "tool_use":
            name = block.get("name", "tool")
            parts.append(f"[tool_use:{name}]")

    return "\n".join(parts).strip()


def to_nvidia_messages(payload: dict) -> list[dict]:
    messages: list[dict] = []

    system = payload.get("system")
    if isinstance(system, str) and system.strip():
        messages.append({"role": "system", "content": system})
    elif isinstance(system, list):
        system_text = flatten_content(system)
        if system_text:
            messages.append({"role": "system", "content": system_text})

    for message in payload.get("messages", []):
        if not isinstance(message, dict):
            continue
        role = message.get("role")
        if role not in {"user", "assistant", "system"}:
            continue
        content = flatten_content(message.get("content"))
        if content:
            messages.append({"role": role, "content": content})

    return messages


def call_nvidia(payload: dict) -> dict:
    messages = to_nvidia_messages(payload)
    if not messages:
        raise ValueError("No messages were provided")

    request_body = {
        "model": DEFAULT_MODEL,
        "messages": messages,
        "temperature": payload.get("temperature", 0.2),
        "max_tokens": payload.get("max_tokens", 4096),
    }

    request = urllib.request.Request(
        f"{NVIDIA_API_BASE_URL}/chat/completions",
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=120) as response:
        raw = response.read().decode("utf-8")
        return json.loads(raw)


class ProxyHandler(BaseHTTPRequestHandler):
    server_version = "claude-nim-proxy/1.0"

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return

    def _send_json(self, status: int, payload: dict) -> None:
        print(f"Resp: {status} {payload}", file=sys.stderr)
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "authorization, content-type, x-api-key")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "authorization, content-type, x-api-key")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()

    def do_GET(self):  # noqa: N802
        print(f"GET {self.path}", file=sys.stderr)
        if self.path.split("?")[0].rstrip("/") in {"/health", ""}:
            self._send_json(200, {"status": "ok", "provider": "nvidia", "model": DEFAULT_MODEL})
            return

        if self.path.split("?")[0].rstrip("/") == "/api/claude_cli/bootstrap":
            self._send_json(
                200,
                {
                    "client_data": {},
                    "additional_model_options": [
                        {
                            "model": "nvidia-coder",
                            "name": "NVIDIA Coder",
                            "description": f"NVIDIA-hosted coding model via {DEFAULT_MODEL}",
                        }
                    ],
                    "additional_model_costs": {
                        "nvidia-coder": {
                            "input_tokens": 0,
                            "output_tokens": 0,
                            "prompt_cache_write_tokens": 0,
                            "prompt_cache_read_tokens": 0,
                            "web_search_requests": 0,
                        }
                    },
                    "oauth_account": None,
                },
            )
            return

        if self.path.split("?")[0].rstrip("/") == "/v1/models":
            self._send_json(
                200,
                {
                    "data": [
                        {
                            "type": "model",
                            "id": model_id,
                            "display_name": model_id,
                            "created_at": "2024-10-22T00:00:00Z"
                        }
                        for model_id in CLAUDE_MODEL_OPTIONS
                    ],
                    "has_more": False,
                    "first_id": CLAUDE_MODEL_OPTIONS[0] if CLAUDE_MODEL_OPTIONS else None,
                    "last_id": CLAUDE_MODEL_OPTIONS[-1] if CLAUDE_MODEL_OPTIONS else None,
                },
            )
            return

        self._send_json(404, {"error": "not_found"})

    def do_POST(self):  # noqa: N802
        print(f"POST {self.path}", file=sys.stderr)
        if not self.path.split("?")[0].rstrip("/").endswith("/v1/messages"):
            self._send_json(404, {"error": "not_found"})
            return

        if not NVIDIA_API_KEY:
            self._send_json(500, {"error": "NVIDIA_API_KEY is required"})
            return

        content_length = int(self.headers.get("Content-Length", "0") or 0)
        if content_length <= 0:
            self._send_json(400, {"error": "missing_request_body"})
            return

        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json(400, {"error": "invalid_json"})
            return

        try:
            response = call_nvidia(payload)
            choice = response.get("choices", [{}])[0]
            message = choice.get("message", {})
            content = message.get("content")
            if isinstance(content, list):
                text_parts = [block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text"]
                content_text = "".join(text_parts)
            else:
                content_text = str(content or "")

            usage = response.get("usage", {})
            anthropic_response = {
                "id": f"msg_{uuid.uuid4().hex}",
                "type": "message",
                "role": "assistant",
                "model": payload.get("model") or CLAUDE_MODEL_OPTIONS[0],
                "content": [
                    {
                        "type": "text",
                        "text": content_text,
                    }
                ],
                "stop_reason": choice.get("finish_reason") or "end_turn",
                "stop_sequence": None,
                "usage": {
                    "input_tokens": int(usage.get("prompt_tokens") or 0),
                    "output_tokens": int(usage.get("completion_tokens") or 0),
                },
            }
            self._send_json(200, anthropic_response)
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", errors="replace")
            self._send_json(error.code, {"error": body or error.reason})
        except Exception as error:  # noqa: BLE001
            self._send_json(500, {"error": str(error)})


def main() -> int:
    if not NVIDIA_API_KEY:
        print("NVIDIA_API_KEY is required.", file=sys.stderr)
        return 2

    server = ThreadingHTTPServer((HOST, PORT), ProxyHandler)
    print(f"Claude Code proxy listening on http://{HOST}:{PORT} using {DEFAULT_MODEL}", flush=True)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())