import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, getClientIp } from '../rate-limit.ts';

test('allows up to the limit then blocks', () => {
  const name = 'rl-limit';
  assert.equal(checkRateLimit(name, 'a', 2, 1000).allowed, true);
  assert.equal(checkRateLimit(name, 'a', 2, 1000).remaining, 0);
  assert.equal(checkRateLimit(name, 'a', 2, 1000).allowed, false);
});

test('keys are isolated per client', () => {
  const name = 'rl-keys';
  checkRateLimit(name, 'a', 1, 1000);
  assert.equal(checkRateLimit(name, 'b', 1, 1000).allowed, true);
});

test('bucket resets after the window', async () => {
  const name = 'rl-reset';
  checkRateLimit(name, 'a', 1, 20);
  assert.equal(checkRateLimit(name, 'a', 1, 20).allowed, false);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(checkRateLimit(name, 'a', 1, 20).allowed, true);
});

test('getClientIp reads x-forwarded-for, then x-real-ip, else unknown', () => {
  const req = (h: Record<string, string>) => new Request('http://x', { headers: h });
  assert.equal(getClientIp(req({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' })), '1.1.1.1');
  assert.equal(getClientIp(req({ 'x-real-ip': '3.3.3.3' })), '3.3.3.3');
  assert.equal(getClientIp(req({})), 'unknown');
});
