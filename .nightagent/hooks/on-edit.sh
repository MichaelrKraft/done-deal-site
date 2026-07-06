#!/bin/bash
# on-edit.sh — Runs after every file edit by the agent.
# Enforces lint and typecheck as a quality gate.
# Exit 2 = block the agent and feed the error back to it.
# Exit 0 = all good, proceed.

FILE_PATH="$1"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

cd "$PROJECT_DIR" || exit 0

# Only run checks on source files, not config or markdown
if [[ "$FILE_PATH" == *.md ]] || [[ "$FILE_PATH" == *.json ]] || [[ "$FILE_PATH" == *.lock ]]; then
  exit 0
fi

# --- Debounce: skip lint/typecheck if the last check ran less than 60 seconds ago.
# This prevents wasting 30-50% of session time on redundant checks during rapid edits.
# A timestamp file in /tmp tracks when checks last ran, keyed by a hash of the project dir.
DEBOUNCE_SECONDS=60
PROJECT_HASH=$(echo "$PROJECT_DIR" | md5 2>/dev/null | cut -c1-8 || echo "$PROJECT_DIR" | md5sum | cut -c1-8)
TIMESTAMP_FILE="/tmp/nightagent-last-check-${PROJECT_HASH}"

if [ -f "$TIMESTAMP_FILE" ]; then
  LAST_CHECK=$(stat -f %m "$TIMESTAMP_FILE" 2>/dev/null || stat -c %Y "$TIMESTAMP_FILE" 2>/dev/null)
  NOW=$(date +%s)
  ELAPSED=$(( NOW - LAST_CHECK ))
  if [ "$ELAPSED" -lt "$DEBOUNCE_SECONDS" ]; then
    exit 0
  fi
fi

ERRORS=""

# Run lint once, capture output and exit code
LINT_OUTPUT=$(npm run lint --if-present 2>&1)
LINT_EXIT=$?
if [ $LINT_EXIT -ne 0 ]; then
  ERRORS="$ERRORS\n\n### Lint Errors\n$LINT_OUTPUT"
fi

# Run typecheck once, capture output and exit code
TYPE_OUTPUT=$(npm run typecheck --if-present 2>&1)
TYPE_EXIT=$?
if [ $TYPE_EXIT -ne 0 ]; then
  ERRORS="$ERRORS\n\n### TypeScript Errors\n$TYPE_OUTPUT"
fi

# Update the timestamp file so subsequent edits within 60s skip checks
touch "$TIMESTAMP_FILE"

if [ -n "$ERRORS" ]; then
  echo -e "Quality gate failed after editing $FILE_PATH. You MUST fix these errors before continuing:$ERRORS" >&2
  exit 2
fi

exit 0
