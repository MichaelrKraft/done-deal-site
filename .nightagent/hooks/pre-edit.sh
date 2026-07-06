#!/bin/bash
# pre-edit.sh — Blocks edits to protected files (.env, secrets, keys).
# Exit 2 = block the tool use. Exit 0 = allow.

TOOL_NAME="${TOOL_NAME:-}"
FILE_PATH="${TOOL_INPUT_FILE_PATH:-$1}"

# Only check file-editing tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Skip if no file path
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")
DIRPATH=$(dirname "$FILE_PATH")

# Block .env files
if [[ "$BASENAME" == .env* ]]; then
  echo "BLOCKED: Cannot modify $BASENAME — protected by NightAgent" >&2
  exit 2
fi

# Block key/certificate files
if [[ "$BASENAME" == *.pem ]] || [[ "$BASENAME" == *.key ]]; then
  echo "BLOCKED: Cannot modify $BASENAME — protected by NightAgent" >&2
  exit 2
fi

# Block secrets directory
if [[ "$FILE_PATH" == */secrets/* ]]; then
  echo "BLOCKED: Cannot modify files in secrets/ — protected by NightAgent" >&2
  exit 2
fi

exit 0
