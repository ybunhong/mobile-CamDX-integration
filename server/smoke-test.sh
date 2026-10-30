#!/usr/bin/env bash
# Boots the enrolment server on a spare port and exercises every endpoint.
# Replaces the old Jest suite: it tests the one thing that can be tested
# without an Android build — the server contract the app depends on.
set -euo pipefail

PORT="${PORT:-3101}"
BASE="http://127.0.0.1:${PORT}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail() { echo "FAIL: $*" >&2; exit 1; }

PORT="$PORT" node "$ROOT/server/index.js" > /tmp/enrolment-smoke.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

# Wait for the port to accept connections.
for _ in $(seq 1 40); do
  if curl -sf "$BASE/health" > /dev/null 2>&1; then break; fi
  sleep 0.25
done
curl -sf "$BASE/health" > /dev/null || fail "server did not start (see /tmp/enrolment-smoke.log)"

BODY='{"idNumber":"011196245","userInfo":{"idNumber":"011196245","lastNameEn":"ENG","firstNameEn":"KADOL"},"selfieFeature":"QUJD","documentFeature":"REVG"}'

echo "1. health reports an empty store"
curl -sf "$BASE/health" | grep -q '"count":0' || fail "expected count 0"

echo "2. first enrolment is an insert"
RESP=$(curl -sf -X POST "$BASE/api/enrollments" -H 'Content-Type: application/json' -d "$BODY")
echo "$RESP" | grep -q '"replaced":false' || fail "expected replaced=false, got: $RESP"

echo "3. re-enrolling the same ID replaces the record"
RESP=$(curl -sf -X POST "$BASE/api/enrollments" -H 'Content-Type: application/json' -d "$BODY")
echo "$RESP" | grep -q '"replaced":true' || fail "expected replaced=true, got: $RESP"

echo "4. store still holds exactly one record"
curl -sf "$BASE/health" | grep -q '"count":1' || fail "expected count 1"

echo "5. list returns the stored features"
curl -sf "$BASE/api/enrollments" | grep -q '"selfieFeature":"QUJD"' || fail "selfieFeature missing"

echo "6. incomplete payloads are rejected"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/enrollments" \
  -H 'Content-Type: application/json' -d '{}')
[ "$CODE" = "400" ] || fail "expected 400, got $CODE"

echo "7. delete removes the record"
curl -sf -X DELETE "$BASE/api/enrollments/011196245" > /dev/null || fail "delete failed"
curl -sf "$BASE/health" | grep -q '"count":0' || fail "expected count 0 after delete"

echo "PASS: server contract verified"
