import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, parseSignup } from './signup-validation.ts';

const good = { firstName: ' Ann ', lastName: 'Lee', email: 'ANN@Example.com', phone: '(303) 555-0100' };

test('parseSignup trims and lowercases', () => {
  const r = parseSignup(good);
  assert.ok(r.ok && r.value.firstName === 'Ann' && r.value.email === 'ann@example.com');
});

test('parseSignup rejects non-strings (object injected as name)', () => {
  assert.equal(parseSignup({ ...good, firstName: { a: 1 } }).ok, false);
});

test('parseSignup rejects bad email, bad phone, long name, non-object', () => {
  assert.equal(parseSignup({ ...good, email: 'nope' }).ok, false);
  assert.equal(parseSignup({ ...good, phone: 'abc' }).ok, false);
  assert.equal(parseSignup({ ...good, lastName: 'x'.repeat(61) }).ok, false);
  assert.equal(parseSignup(null).ok, false);
});

test('escapeHtml neutralizes markup', () => {
  assert.equal(escapeHtml('<a href="x">&</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
});
