// End-to-end smoke test against a running API (npm run dev:server) with demo users seeded.
//   node --test server/test/smoke.test.mjs
// Creates throwaway accounts and data; point it at a development database only.

import assert from 'node:assert/strict';
import { test } from 'node:test';

const API = (process.env.API_URL || 'http://localhost:4000') + '/api/v1';
const run = Date.now().toString(36);
const STRONG_PASSWORD = 'Sm0ke-Test-Pass!';

async function call(method, path, { token, body, cookie } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, data: await res.json().catch(() => null), cookie: setCookie ? setCookie.split(';')[0] : null };
}

async function register(label, role = 'BUILDER') {
  const email = `${label}-${run}@smoke.test`;
  const res = await call('POST', '/auth/register', { body: { email, password: STRONG_PASSWORD, organizationName: `${label} ${run} Ltd`, role } });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  return { email, token: res.data.accessToken, cookie: res.cookie, session: res.data.session };
}

const meta = (await call('GET', '/meta')).data;

async function loginDemo(email) {
  const res = await call('POST', '/auth/login', { body: { email, password: meta.demoPassword } });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  return { token: res.data.accessToken, cookie: res.cookie, session: res.data.session };
}

test('registration enforces the password policy and blocks privileged roles', async () => {
  const weak = await call('POST', '/auth/register', { body: { email: `weak-${run}@smoke.test`, password: 'short', organizationName: 'Weak Co', role: 'BUILDER' } });
  assert.equal(weak.status, 400);
  const admin = await call('POST', '/auth/register', { body: { email: `adm-${run}@smoke.test`, password: STRONG_PASSWORD, organizationName: 'Sneaky Co', role: 'ADMIN' } });
  assert.equal(admin.status, 400);
});

test('login returns role permissions; wrong password is rejected', async () => {
  const bad = await call('POST', '/auth/login', { body: { email: 'builder@realtyconnect.com', password: 'nope-nope-nope' } });
  assert.equal(bad.status, 401);
  const { session } = await loginDemo('builder@realtyconnect.com');
  assert.equal(session.role, 'BUILDER');
  assert.ok(session.permissions.includes('CREATE_RFQ'));
  assert.ok(!session.permissions.includes('MANAGE_USERS'));
  assert.equal(session.organizationName, 'Apex Developers Ltd');
});

test('refresh tokens rotate and die on logout', async () => {
  const user = await register('refresh');
  const refreshed = await call('POST', '/auth/refresh', { cookie: user.cookie });
  assert.equal(refreshed.status, 200);
  assert.notEqual(refreshed.cookie, user.cookie);
  const reuse = await call('POST', '/auth/refresh', { cookie: user.cookie });
  assert.equal(reuse.status, 401, 'a used refresh token must not work twice');
  await call('POST', '/auth/logout', { cookie: refreshed.cookie });
  assert.equal((await call('POST', '/auth/refresh', { cookie: refreshed.cookie })).status, 401);
});

test('five wrong passwords lock the account (Rule AUTH-02)', async () => {
  const user = await register('lockout');
  for (let i = 0; i < 4; i++) {
    assert.equal((await call('POST', '/auth/login', { body: { email: user.email, password: 'wrong-password-1A!' } })).status, 401);
  }
  const fifth = await call('POST', '/auth/login', { body: { email: user.email, password: 'wrong-password-1A!' } });
  assert.equal(fifth.status, 403);
  assert.ok(fifth.data.lockoutUntil);
  const correct = await call('POST', '/auth/login', { body: { email: user.email, password: STRONG_PASSWORD } });
  assert.equal(correct.status, 403, 'correct credentials are refused during the lockout');
});

test('workspace lists sync as per-item diffs and are isolated per organization', async () => {
  const a = await register('tenant-a');
  const b = await register('tenant-b');
  const key = 'realtyconnect_leads';

  assert.equal((await call('GET', '/store', { token: a.token })).data.values[key], undefined, 'unset keys are absent');

  const seedLeads = [
    { id: 'L1', title: 'First', price: '$500', nested: { a: 1 } },
    { id: 'L2', title: 'Second', optional: 'x' },
  ];
  assert.equal((await call('PATCH', `/store/${key}`, { token: a.token, body: { type: 'list', upsert: seedLeads, remove: [], order: ['L1', 'L2'] } })).status, 200);
  assert.deepEqual((await call('GET', '/store', { token: a.token })).data.values[key], seedLeads);

  // Update one item (dropping a field), add one at the front, remove one.
  await call('PATCH', `/store/${key}`, {
    token: a.token,
    body: { type: 'list', upsert: [{ id: 'L2', title: 'Second (edited)' }, { id: 'L3', title: 'Third' }], remove: ['L1'], order: ['L3', 'L2'] },
  });
  assert.deepEqual((await call('GET', '/store', { token: a.token })).data.values[key], [
    { id: 'L3', title: 'Third' },
    { id: 'L2', title: 'Second (edited)' },
  ]);

  assert.equal((await call('GET', '/store', { token: b.token })).data.values[key], undefined, 'another organization sees nothing');
  assert.equal((await call('GET', '/store')).status, 401);
  assert.equal((await call('PATCH', '/store/not_a_key', { token: a.token, body: { type: 'value', value: 1 } })).status, 404);
  assert.equal((await call('PATCH', `/store/${key}`, { token: a.token, body: { type: 'list', upsert: [{ id: 'X', $where: 'x' }], remove: [] } })).status, 400);
});

test('user-scoped values are private; public lists are shared but only the publisher can withdraw', async () => {
  const a = await register('pub-a');
  const b = await register('pub-b');

  await call('PATCH', '/store/realtyconnect_saved_listings', { token: a.token, body: { type: 'value', value: ['mkt-1'] } });
  assert.deepEqual((await call('GET', '/store', { token: a.token })).data.values.realtyconnect_saved_listings, ['mkt-1']);
  assert.equal((await call('GET', '/store', { token: b.token })).data.values.realtyconnect_saved_listings, undefined);

  const key = 'realtyconnect_marketplace_listings';
  const id = `smoke-${run}`;
  // Writing to a platform-wide list marks it as initialised, after which the app no longer loads its
  // starter data. If this test is the first writer, it puts the list back to "never used" at the end.
  const admin = await loginDemo('admin@realtyconnect.com');
  const wasInitialised = (await call('GET', '/store', { token: admin.token })).data.values[key] !== undefined;
  await call('PATCH', `/store/${key}`, { token: a.token, body: { type: 'list', upsert: [{ id, title: 'Cement' }], remove: [] } });
  const seenByB = (await call('GET', '/store', { token: b.token })).data.values[key];
  assert.ok(seenByB.some(item => item.id === id), 'public listing is visible to other organizations');

  const foreignRemove = await call('PATCH', `/store/${key}`, { token: b.token, body: { type: 'list', upsert: [], remove: [id] } });
  assert.equal(foreignRemove.data.skipped, 1, 'another organization cannot withdraw it');
  assert.equal((await call('PATCH', `/store/${key}`, { token: b.token, body: { type: 'clear' } })).status, 403);
  const ownRemove = await call('PATCH', `/store/${key}`, { token: a.token, body: { type: 'list', upsert: [], remove: [id] } });
  assert.equal(ownRemove.data.skipped, 0);
  if (!wasInitialised) {
    assert.equal((await call('PATCH', `/store/${key}`, { token: admin.token, body: { type: 'clear' } })).status, 200);
  }
});

test('a list key degrades to a whole value when its items lack unique ids, and recovers', async () => {
  const user = await register('fallback');
  const key = 'rc_net_timeline';
  const duplicates = [{ id: 'same', n: 1 }, { id: 'same', n: 2 }];
  await call('PATCH', `/store/${key}`, { token: user.token, body: { type: 'list', upsert: [{ id: 'old', n: 0 }], remove: [] } });
  assert.equal((await call('PATCH', `/store/${key}`, { token: user.token, body: { type: 'value', value: duplicates } })).status, 200);
  assert.deepEqual((await call('GET', '/store', { token: user.token })).data.values[key], duplicates);
  await call('PATCH', `/store/${key}`, { token: user.token, body: { type: 'list', upsert: [{ id: 'a', n: 1 }, { id: 'b', n: 2 }], remove: [], order: ['a', 'b'] } });
  assert.deepEqual((await call('GET', '/store', { token: user.token })).data.values[key], [{ id: 'a', n: 1 }, { id: 'b', n: 2 }]);
});

test('a registered company appears in the directory and owns its profile', async () => {
  const a = await register('dir-a', 'MATERIAL_SUPPLIER');
  const b = await register('dir-b');
  const idA = a.session.orgId;

  const listed = (await call('GET', '/companies')).data;
  const card = listed.find(c => c.id === idA);
  assert.ok(card, 'new company is listed without signing in');
  assert.equal(card.category, 'Material Vendors');
  assert.equal(card.verified, false, 'nobody is verified by default');
  assert.ok(!listed.some(c => c.name === 'Regulatory Directorate'), 'platform operator is not a listed business');

  const saved = await call('PUT', '/companies/me', {
    token: a.token,
    body: { tagline: 'Bulk TMT steel', city: 'Nagpur', state: 'Maharashtra', products: ['Fe550D TMT bars'], phone: '+91 90000 00000', verified: true, membership: 'Enterprise Platinum' },
  });
  assert.equal(saved.status, 200, JSON.stringify(saved.data));
  assert.equal(saved.data.verified, false, 'a company cannot verify itself');
  assert.equal(saved.data.membership, 'Basic', 'a company cannot grant itself a plan');
  assert.equal((await call('PUT', '/companies/me', { token: a.token, body: { coverBanner: 'javascript:alert(1)' } })).status, 400);
  assert.equal((await call('PUT', '/companies/me', { body: { tagline: 'x' } })).status, 401);

  const seenByB = (await call('GET', `/companies/${idA}`, { token: b.token })).data;
  assert.equal(seenByB.tagline, 'Bulk TMT steel');
  assert.deepEqual(seenByB.products, ['Fe550D TMT bars']);
  assert.equal(seenByB.isOwner, false);
  assert.equal((await call('GET', '/companies')).data.find(c => c.id === idA).city, 'Nagpur');

  // Reviews: not on yourself, one per reviewing company, rating is computed.
  assert.equal((await call('POST', `/companies/${idA}/reviews`, { token: a.token, body: { rating: 5, comment: 'We are great' } })).status, 403);
  await call('POST', `/companies/${idA}/reviews`, { token: b.token, body: { rating: 2, comment: 'Late delivery' } });
  const reviewed = (await call('POST', `/companies/${idA}/reviews`, { token: b.token, body: { rating: 4, comment: 'Improved a lot' } })).data;
  assert.equal(reviewed.reviews.length, 1);
  assert.equal(reviewed.rating, 4);
  assert.match(reviewed.reviews[0].authorCompany, /^dir-b/);

  // Visibility settings are honoured.
  await call('PUT', '/companies/me', { token: a.token, body: { contactVisibility: 'None' } });
  assert.equal((await call('GET', `/companies/${idA}`, { token: b.token })).data.phone, '');
  assert.equal((await call('GET', '/companies/me', { token: a.token })).data.phone, '+91 90000 00000', 'the owner still sees its own contact details');
  await call('PUT', '/companies/me', { token: a.token, body: { profileVisibility: 'Private' } });
  assert.equal((await call('GET', `/companies/${idA}`, { token: b.token })).status, 404);
  assert.ok(!(await call('GET', '/companies')).data.some(c => c.id === idA), 'private companies leave the directory');
});

test('RBAC guards platform administration', async () => {
  const builder = await loginDemo('builder@realtyconnect.com');
  const admin = await loginDemo('admin@realtyconnect.com');

  assert.equal((await call('POST', '/masters', { token: builder.token, body: { category: 'GEOGRAPHY_CITY', code: 'x', name: 'X' } })).status, 403);
  assert.equal((await call('PUT', '/configs/MAX_UPLOAD_SIZE_MB', { token: builder.token, body: { value: '99' } })).status, 403);
  assert.equal((await call('GET', '/audit-logs', { token: builder.token })).status, 403);

  const code = `SMOKE_${run}`.toUpperCase();
  const created = await call('POST', '/masters', { token: admin.token, body: { category: 'GEOGRAPHY_CITY', code, name: 'Smoke City' } });
  assert.equal(created.status, 201);
  assert.equal((await call('POST', '/masters', { token: admin.token, body: { category: 'GEOGRAPHY_CITY', code, name: 'Dup' } })).status, 409);
  assert.equal((await call('DELETE', `/masters/${created.data.id}`, { token: admin.token })).status, 200);

  const masters = (await call('GET', '/masters')).data;
  const systemItem = masters[0].items.find(i => i.isSystem);
  assert.equal((await call('DELETE', `/masters/${systemItem.id}`, { token: admin.token })).status, 409, 'system masters are locked');

  assert.equal((await call('PUT', '/configs/MAX_UPLOAD_SIZE_MB', { token: admin.token, body: { value: 'abc' } })).status, 400);
  assert.equal((await call('PUT', '/roles/ADMIN/permissions', { token: admin.token, body: { permissions: ['VIEW_AUDIT_LOGS'] } })).status, 409);
});

test('multi-role accounts switch identity and get that role\'s permissions', async () => {
  const admin = await loginDemo('admin@realtyconnect.com');
  const switched = await call('POST', '/auth/switch-role', { token: admin.token, cookie: admin.cookie, body: { role: 'COMPLIANCE_AUDITOR' } });
  assert.equal(switched.status, 200);
  assert.equal(switched.data.session.role, 'COMPLIANCE_AUDITOR');
  assert.ok(!switched.data.session.permissions.includes('MANAGE_USERS'));
  assert.equal((await call('POST', '/auth/switch-role', { token: admin.token, body: { role: 'BUILDER' } })).status, 403);
});

test('audit log is hash-chained and verifies', async () => {
  const admin = await loginDemo('admin@realtyconnect.com');
  const posted = await call('POST', '/audit-logs', {
    token: admin.token,
    body: { action: 'SMOKE_TEST', entity: 'tests', entityId: run, status: 'SUCCESS', details: 'smoke: test' },
  });
  assert.equal(posted.status, 201);
  assert.match(posted.data.chainHash, /^[0-9a-f]{64}$/);
  assert.equal(posted.data.userId, 'admin@realtyconnect.com', 'actor comes from the session');
  const logs = (await call('GET', '/audit-logs?limit=5', { token: admin.token })).data;
  assert.equal(logs[0].id, posted.data.id);
  const verification = (await call('GET', '/audit-logs/verify', { token: admin.token })).data;
  assert.equal(verification.valid, true, JSON.stringify(verification));
});

test('file uploads are type-checked by content and released from quarantine', async () => {
  const user = await register('files');
  const upload = async (name, bytes) => {
    const form = new FormData();
    form.append('file', new Blob([bytes]), name);
    const res = await fetch(API + '/files', { method: 'POST', headers: { Authorization: `Bearer ${user.token}` }, body: form });
    return { status: res.status, data: await res.json() };
  };

  assert.equal((await upload('payload.exe', Buffer.from('MZ fake'))).status, 415);
  assert.equal((await upload('disguised.pdf', Buffer.from('MZ fake exe renamed'))).status, 415, 'extension alone is not trusted');

  const pdf = await upload('plan.pdf', Buffer.from('%PDF-1.4 smoke test'));
  assert.equal(pdf.status, 202);
  assert.equal(pdf.data.status, 'scanning');
  assert.equal((await fetch(API + `/files/${pdf.data.id}/download`, { headers: { Authorization: `Bearer ${user.token}` } })).status, 409);

  await new Promise(resolve => setTimeout(resolve, 2600));
  assert.equal((await call('GET', `/files/${pdf.data.id}`, { token: user.token })).data.status, 'success');
  const download = await fetch(API + `/files/${pdf.data.id}/download`, { headers: { Authorization: `Bearer ${user.token}` } });
  assert.equal(await download.text(), '%PDF-1.4 smoke test');

  const other = await register('files-other');
  assert.equal((await call('GET', `/files/${pdf.data.id}`, { token: other.token })).status, 404, 'other organizations cannot see the file');
  assert.equal((await call('DELETE', `/files/${pdf.data.id}`, { token: user.token })).status, 200);
});
