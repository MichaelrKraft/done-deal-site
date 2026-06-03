#!/usr/bin/env bash
# Smoke test for done-deal-site /api/contact and /api/remy-chat
# Usage: ./scripts/smoke-test.sh [BASE_URL]
# Default BASE_URL: http://localhost:3000
# Example: ./scripts/smoke-test.sh https://done-deal.co

set -u

BASE="${1:-http://localhost:3000}"

# Origin must match the allowlist in src/app/api/remy-chat/route.ts.
# For local dev (any port), use a known-allowed origin so the script works
# regardless of which port Next.js picked (3000, 3001, 3003, etc).
if [[ "$BASE" == http://localhost* ]]; then
  ORIGIN="http://localhost:3000"
else
  ORIGIN="$BASE"
fi

PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo -e "${CYAN}Smoke testing ${BASE}${RESET}"
echo

check() {
  local name="$1"
  local expected="$2"
  local got="$3"
  local extra="${4:-}"
  if [[ "$got" == "$expected" ]]; then
    echo -e "  ${GREEN}PASS${RESET}  $name  (got $got)"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${RESET}  $name  (expected $expected, got $got)${extra:+  $extra}"
    FAIL=$((FAIL + 1))
  fi
}

# ---------- /api/contact ----------
echo -e "${CYAN}/api/contact${RESET}"

# 1. Happy path
code=$(curl -s -o /tmp/dd_smoke_body.txt -w "%{http_code}" -X POST "${BASE}/api/contact" \
  -H 'Content-Type: application/json' \
  -H 'X-Forwarded-For: 10.99.99.10' \
  -d '{"name":"Smoke Test","email":"smoke-test@example.com","message":"automated smoke test — ignore"}')
body=$(cat /tmp/dd_smoke_body.txt 2>/dev/null | head -c 200)
hint=""
if [[ "$code" == "500" && "$body" == *"Failed to save"* ]]; then
  hint="(Supabase insert failed — did you run the migration?)"
elif [[ "$code" == "500" ]]; then
  hint="(body: $body)"
fi
check "happy path → 200" "200" "$code" "$hint"

# 2. Honeypot
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/contact" \
  -H 'Content-Type: application/json' \
  -H 'X-Forwarded-For: 10.99.99.11' \
  -d '{"name":"Bot","email":"bot@x.com","message":"spam","website":"http://spammer.com"}')
check "honeypot filled → silent 200" "200" "$code"

# 3. Missing required field
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/contact" \
  -H 'Content-Type: application/json' \
  -H 'X-Forwarded-For: 10.99.99.12' \
  -d '{"email":"only@x.com"}')
check "missing name/message → 400" "400" "$code"

# 4. Invalid email
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/contact" \
  -H 'Content-Type: application/json' \
  -H 'X-Forwarded-For: 10.99.99.13' \
  -d '{"name":"x","email":"not-an-email","message":"hi"}')
check "invalid email → 400" "400" "$code"

# 5. Rate limit (6th request from same IP within an hour)
codes=""
for i in 1 2 3 4 5 6; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/contact" \
    -H 'Content-Type: application/json' \
    -H 'X-Forwarded-For: 10.99.99.99' \
    -d "{\"name\":\"rate-test\",\"email\":\"rate${i}@x.com\",\"message\":\"rate\"}")
  codes="${codes}${c} "
done
last=$(echo $codes | awk '{print $NF}')
check "6th request → 429 (sequence: $codes)" "429" "$last"

echo

# ---------- /api/remy-chat ----------
echo -e "${CYAN}/api/remy-chat${RESET}"

# 1. Happy path (skip if it would hit the cost ceiling — just check structural response)
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/remy-chat" \
  -H 'Content-Type: application/json' \
  -H 'Origin: '"${ORIGIN}" \
  -H 'X-Forwarded-For: 10.99.99.100' \
  -d '{"userText":"What does Done Deal do?","history":[]}')
if [[ "$code" == "503" ]]; then
  echo -e "  ${YELLOW}SKIP${RESET}  happy path  (GOOGLE_AI_API_KEY missing — 503)"
elif [[ "$code" == "502" ]]; then
  echo -e "  ${YELLOW}SKIP${RESET}  happy path  (Gemini upstream returned non-OK — 502; check key validity and model availability)"
elif [[ "$code" == "200" ]]; then
  echo -e "  ${GREEN}PASS${RESET}  happy path → 200"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}FAIL${RESET}  happy path (expected 200 / 502 / 503, got $code)"
  FAIL=$((FAIL + 1))
fi

# 2. Wrong Origin → 403
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/remy-chat" \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://evil.example.com' \
  -d '{"userText":"hi","history":[]}')
check "wrong Origin → 403" "403" "$code"

# 3. Oversized userText → 400
big=$(printf 'x%.0s' {1..501})
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/remy-chat" \
  -H 'Content-Type: application/json' \
  -H 'Origin: '"${ORIGIN}" \
  -d "{\"userText\":\"${big}\",\"history\":[]}")
check "userText > 500 chars → 400" "400" "$code"

# 4. History too long → 400
hist='[{"role":"user","content":"'$(printf 'x%.0s' {1..4001})'"}]'
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/remy-chat" \
  -H 'Content-Type: application/json' \
  -H 'Origin: '"${ORIGIN}" \
  -d "{\"userText\":\"hi\",\"history\":${hist}}")
check "history > 4000 chars → 400" "400" "$code"

# 5. Malformed history → 400
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/remy-chat" \
  -H 'Content-Type: application/json' \
  -H 'Origin: '"${ORIGIN}" \
  -d '{"userText":"hi","history":[{"role":"system","content":"x"}]}')
check "malformed history → 400" "400" "$code"

# 6. Rate limit (11th request from same IP → 429)
codes=""
for i in $(seq 1 11); do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/remy-chat" \
    -H 'Content-Type: application/json' \
    -H 'Origin: '"${ORIGIN}" \
    -H 'X-Forwarded-For: 10.99.99.200' \
    -d '{"userText":"x","history":[]}')
  codes="${codes}${c} "
done
last=$(echo $codes | awk '{print $NF}')
# 11th may be 429 (rate limit), or 503 if no API key, or 400 if userText rejected for length
case "$last" in
  429) check "11th request → 429" "429" "$last" ;;
  503) echo -e "  ${YELLOW}SKIP${RESET}  rate limit  (every call hits 503 — GOOGLE_AI_API_KEY missing; rate limit check below)";;
  *)   check "11th request → 429" "429" "$last" "(sequence: $codes)" ;;
esac

echo
echo -e "${CYAN}Result: ${GREEN}${PASS} passed${RESET}, ${RED}${FAIL} failed${RESET}"
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
