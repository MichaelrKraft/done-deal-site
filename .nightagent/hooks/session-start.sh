#!/bin/bash
# session-start.sh — Runs at the start of each Claude Code agent session.
# Logs the session start and injects git context into the environment.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_DIR="$PROJECT_DIR/.nightagent/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMIT=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null || echo "no commits")

echo "[$TIMESTAMP] NightAgent session started on branch: $BRANCH" >> "$LOG_DIR/session.log"
echo "[$TIMESTAMP] Last commit: $LAST_COMMIT" >> "$LOG_DIR/session.log"

# Inject context into the session via stdout (picked up by SessionStart hook)
echo "[NightAgent Context] Branch: $BRANCH | Last commit: $LAST_COMMIT | Time: $TIMESTAMP"

exit 0
