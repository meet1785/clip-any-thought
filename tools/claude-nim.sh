#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NVIDIA_API_KEY:-}" ]]; then
  echo "NVIDIA_API_KEY is required." >&2
  exit 2
fi

PROXY_PORT="${CLAUDE_NIM_PROXY_PORT:-4000}"
CLAUDE_MODEL="${CLAUDE_MODEL:-sonnet}"
AUTH_TOKEN="${ANTHROPIC_AUTH_TOKEN:-freecc}"

export ANTHROPIC_BASE_URL="${ANTHROPIC_BASE_URL:-http://127.0.0.1:${PROXY_PORT}}"
export ANTHROPIC_AUTH_TOKEN="$AUTH_TOKEN"
export ANTHROPIC_API_KEY="$AUTH_TOKEN"

exec claude "$@"
