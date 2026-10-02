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

test('companies can reach each other: connections, enquiries, messages, bids, meetings', async () => {
  const a = await register('net-a', 'MATERIAL_SUPPLIER');
  const b = await register('net-b');
  const A = a.session.orgId, B = b.session.orgId;
  const read = async (who, key) => (await call('GET', `/store?keys=${key}`, { token: who.token })).data.values[key];

  // connection request: B -> A
  const req1 = await call('POST', '/network/connections', { token: b.token, body: { toOrgId: A, purpose: 'Steel supply' } });
  assert.equal(req1.status, 201, JSON.stringify(req1.data));
  assert.equal(req1.data.status, 'pending_outgoing');
  assert.equal((await call('POST', '/network/connections', { token: b.token, body: { toOrgId: A } })).status, 409);
  const incoming = (await read(a, 'rc_net_connections')).find(c => c.businessId === B);
  assert.equal(incoming.status, 'pending_incoming');
  assert.equal(incoming.businessName.startsWith('net-b'), true);
  assert.equal((await call('POST', `/network/connections/${incoming.id}/respond`, { token: b.token, body: { accept: true } })).status, 404, 'only the recipient can respond');
  assert.equal((await call('POST', `/network/connections/${incoming.id}/respond`, { token: a.token, body: { accept: true } })).status, 200);
  assert.equal((await read(b, 'rc_net_connections')).find(c => c.businessId === A).status, 'accepted');

  // enquiry: B -> A becomes a lead and a conversation in A
  const enq = await call('POST', '/network/enquiries', { token: b.token, body: { toOrgId: A, kind: 'product', subject: 'TMT bars quote', message: 'Need 80 tons Fe550D', phone: '+91 90000 00000', relatedId: 'L-1', relatedTitle: 'Fe550D' } });
  assert.equal(enq.status, 201, JSON.stringify(enq.data));
  const lead = (await read(a, 'realtyconnect_leads')).find(l => l.id === enq.data.id);
  assert.equal(lead.status, 'New');
  assert.equal(lead.company.startsWith('net-b'), true, 'the lead names the real sender');
  assert.equal((await read(a, 'realtyconnect_product_enquiries'))[0].buyerCompany.startsWith('net-b'), true);
  const convA = (await read(a, 'realtyconnect_conversations')).find(c => c.id === enq.data.conversationId);
  assert.equal(convA.unreadCount, 1);
  assert.equal(convA.companyId, B);

  // A replies on the same conversation; B receives it and A's message shows as read after B opens it
  assert.equal((await call('POST', '/network/messages', { token: a.token, body: { toOrgId: B, conversationId: convA.id, messageId: 'm-reply-1', text: 'Quote attached, valid 7 days.' } })).status, 201);
  const convB = (await read(b, 'realtyconnect_conversations')).find(c => c.id === convA.id);
  assert.equal(convB.messages.at(-1).text, 'Quote attached, valid 7 days.');
  assert.equal(convB.messages.at(-1).sender, 'them');
  // delivering the same message twice does not duplicate it
  await call('POST', '/network/messages', { token: a.token, body: { toOrgId: B, conversationId: convA.id, messageId: 'm-reply-1', text: 'Quote attached, valid 7 days.' } });
  assert.equal((await read(b, 'realtyconnect_conversations')).find(c => c.id === convA.id).messages.filter(m => m.id === 'm-reply-1').length, 1);

  // RFQ bid: A bids on B's RFQ; B accepts; A's copy follows
  const bid = await call('POST', '/network/bids', { token: a.token, body: { toOrgId: B, bidId: 'bid-1', rfqId: 'rfq-1', rfqTitle: 'Steel', quotationAmount: 'INR 54,500/MT', remarks: 'Ex-works' } });
  assert.equal(bid.status, 201);
  const received = (await read(b, 'realtyconnect_quotation_list')).find(q => q.id === 'bid-1');
  assert.equal(received.companyId, A);
  assert.equal(received.status, 'Pending');
  assert.equal((await call('POST', '/network/bids/bid-1/status', { token: a.token, body: { status: 'Accepted' } })).status, 404, 'the bidder cannot accept its own bid');
  assert.equal((await call('POST', '/network/bids/bid-1/status', { token: b.token, body: { status: 'Accepted' } })).status, 200);
  assert.equal((await read(a, 'realtyconnect_quotation_list')).find(q => q.id === 'bid-1').status, 'Accepted');

  // meeting invite
  assert.equal((await call('POST', '/network/meetings', { token: b.token, body: { toOrgId: A, meetingId: 'mt-1', title: 'Site visit', meetingDate: '2026-11-02', startTime: '11:00', endTime: '12:00' } })).status, 201);
  assert.equal((await read(a, 'realtyconnect_meetings')).find(m => m.id === 'mt-1').relatedCompany.startsWith('net-b'), true);

  // notifications reached A, and nobody can address themselves or a stranger
  assert.ok((await call('GET', '/notifications', { token: a.token })).data.length >= 4);
  assert.equal((await call('POST', '/network/messages', { token: a.token, body: { toOrgId: A, conversationId: 'x', messageId: 'y', text: 'hi' } })).status, 400);
  assert.equal((await call('POST', '/network/messages', { token: a.token, body: { toOrgId: '0123456789abcdef01234567', conversationId: 'x', messageId: 'y', text: 'hi' } })).status, 404);
  assert.equal((await call('POST', '/network/messages', { body: {} })).status, 401);
});

test('a company cannot overwrite another company\'s public listing', async () => {
  const a = await register('own-a'), b = await register('own-b');
  const key = 'rc_opportunities';
  await call('PATCH', `/store/${key}`, { token: a.token, body: { type: 'list', upsert: [{ id: `opp-${run}`, title: 'Original' }], remove: [] } });
  const hijack = await call('PATCH', `/store/${key}`, { token: b.token, body: { type: 'list', upsert: [{ id: `opp-${run}`, title: 'Hijacked' }], remove: [] } });
  assert.equal(hijack.status, 403);
  assert.equal((await call('GET', '/store', { token: a.token })).data.values[key].find(o => o.id === `opp-${run}`).title, 'Original');
  await call('PATCH', `/store/${key}`, { token: a.token, body: { type: 'list', upsert: [], remove: [`opp-${run}`] } });
});

test('teams: invitations join the same company, roles limit what a person can change', async () => {
  const owner = await register('team-own', 'BUILDER');
  assert.equal(owner.session.orgRole, 'OWNER');
  const invite = await call('POST', '/team/invites', { token: owner.token, body: { email: `viewer-${run}@smoke.test`, name: 'View Only', orgRole: 'VIEWER' } });
  assert.equal(invite.status, 201, JSON.stringify(invite.data));
  assert.ok(invite.data.code);
  // The Free plan has two seats: the owner plus this invitation. A third is refused.
  assert.equal((await call('POST', '/team/invites', { token: owner.token, body: { email: `extra-${run}@smoke.test`, orgRole: 'MEMBER' } })).status, 402);

  const wrongEmail = await call('POST', '/auth/register', { body: { email: `someone-${run}@smoke.test`, password: STRONG_PASSWORD, inviteCode: invite.data.code } });
  assert.equal(wrongEmail.status, 400, 'an invitation only works for the invited email');
  const joined = await call('POST', '/auth/register', { body: { email: `viewer-${run}@smoke.test`, password: STRONG_PASSWORD, inviteCode: invite.data.code } });
  assert.equal(joined.status, 201, JSON.stringify(joined.data));
  assert.equal(joined.data.session.orgId, owner.session.orgId, 'the invited person joins the inviting company');
  assert.equal(joined.data.session.orgRole, 'VIEWER');
  assert.equal(joined.data.session.name, 'View Only');
  assert.equal((await call('POST', '/auth/register', { body: { email: `viewer-${run}@smoke.test`, password: STRONG_PASSWORD, inviteCode: invite.data.code } })).status, 409, 'an invitation is single-use');

  // A viewer sees the company's data but cannot change it or manage the team
  assert.equal((await call('PATCH', '/store/realtyconnect_leads', { token: joined.data.accessToken, body: { type: 'list', upsert: [{ id: 'v1' }], remove: [] } })).status, 403);
  assert.equal((await call('PATCH', '/store/realtyconnect_saved_listings', { token: joined.data.accessToken, body: { type: 'value', value: ['x'] } })).status, 200, 'personal preferences are still allowed');
  assert.equal((await call('POST', '/team/invites', { token: joined.data.accessToken, body: { email: `x-${run}@smoke.test` } })).status, 403);
  assert.equal((await call('PUT', '/companies/me', { token: joined.data.accessToken, body: { tagline: 'hijack' } })).status, 403);

  const team = (await call('GET', '/team', { token: owner.token })).data;
  assert.equal(team.members.length, 2);
  const viewer = team.members.find(m => m.orgRole === 'VIEWER');
  assert.equal((await call('PATCH', `/team/members/${viewer.id}`, { token: owner.token, body: { orgRole: 'MEMBER' } })).status, 200);
  assert.equal((await call('PATCH', `/team/members/${team.members.find(m => m.orgRole === 'OWNER').id}`, { token: owner.token, body: { status: 'INACTIVE' } })).status, 400, 'you cannot lock yourself out');

  // Deactivating ends the person's sessions
  await call('PATCH', `/team/members/${viewer.id}`, { token: owner.token, body: { status: 'INACTIVE' } });
  assert.equal((await call('POST', '/auth/refresh', { cookie: joined.cookie })).status, 401);
  assert.equal((await call('POST', '/auth/login', { body: { email: `viewer-${run}@smoke.test`, password: STRONG_PASSWORD } })).status, 403);
});

test('plans: modules and limits are enforced on the server, and upgrades need confirmed payment', async () => {
  const co = await register('plan-co', 'BUILDER');
  assert.equal(co.session.plan.id, 'plan-free');
  const finance = await call('PATCH', '/store/realtyconnect_finance_billings', { token: co.token, body: { type: 'list', upsert: [{ id: 'i1' }], remove: [] } });
  assert.equal(finance.status, 402, 'Free does not include finance');
  // Free plan: 5 marketplace listings
  const listings = n => Array.from({ length: n }, (_, i) => ({ id: `lst-${run}-${i}`, title: 'x' }));
  assert.equal((await call('PATCH', '/store/realtyconnect_marketplace_listings', { token: co.token, body: { type: 'list', upsert: listings(5), remove: [] } })).status, 200);
  assert.equal((await call('PATCH', '/store/realtyconnect_marketplace_listings', { token: co.token, body: { type: 'list', upsert: [{ id: `lst-${run}-extra`, title: 'x' }], remove: [] } })).status, 402);
  await call('PATCH', '/store/realtyconnect_marketplace_listings', { token: co.token, body: { type: 'list', upsert: [], remove: listings(5).map(l => l.id) } });

  const order = await call('POST', '/billing/orders', { token: co.token, body: { planId: 'plan-enterprise', cycle: 'monthly' } });
  assert.equal(order.status, 201, JSON.stringify(order.data));
  assert.equal(order.data.payment.total, Math.round(29999 * 1.18));
  assert.equal(order.data.payment.status, 'pending');
  let billing = (await call('GET', '/billing', { token: co.token })).data;
  assert.equal(billing.planId, 'plan-free', 'asking for a plan does not give it');
  assert.equal(billing.payments[0].invoiceNo, order.data.payment.invoiceNo);
  assert.equal((await call('POST', '/billing/razorpay/verify', { token: co.token, body: { razorpay_order_id: 'o', razorpay_payment_id: 'p', razorpay_signature: 's' } })).status, 400);
  assert.equal((await call('GET', '/billing/admin/pending', { token: co.token })).status, 403, 'customers cannot see the confirmation queue');
  assert.equal((await call('POST', `/billing/admin/${order.data.payment.id}/confirm`, { token: co.token, body: { method: 'UPI', reference: 'self-confirm' } })).status, 403, 'a company cannot confirm its own payment');

  const admin = await loginDemo('admin@realtyconnect.com');
  const pending = (await call('GET', '/billing/admin/pending', { token: admin.token })).data;
  assert.ok(pending.some(p => p.id === order.data.payment.id && p.company.startsWith('plan-co')));
  assert.equal((await call('POST', `/billing/admin/${order.data.payment.id}/confirm`, { token: admin.token, body: { method: 'Bank transfer', reference: 'UTR123456' } })).status, 200);

  billing = (await call('GET', '/billing', { token: co.token })).data;
  assert.equal(billing.planId, 'plan-enterprise');
  assert.equal(billing.payments[0].status, 'paid');
  assert.equal((await call('PATCH', '/store/realtyconnect_finance_billings', { token: co.token, body: { type: 'list', upsert: [{ id: 'i1' }], remove: [] } })).status, 200, 'finance works after the upgrade');
  const refreshed = await call('POST', '/auth/refresh', { cookie: co.cookie });
  assert.ok(refreshed.data.session.plan.features.includes('finance'));
});

test('verification: IDs are validated, documents attached, and only a reviewer can verify a company', async () => {
  const co = await register('verif-co', 'MATERIAL_SUPPLIER');
  const upload = async (name) => {
    const form = new FormData();
    form.append('file', new Blob(['%PDF-1.4 ' + name]), name);
    const res = await fetch(API + '/files', { method: 'POST', headers: { Authorization: `Bearer ${co.token}` }, body: form });
    return (await res.json()).id;
  };
  const [f1, f2] = [await upload('gst.pdf'), await upload('pan.pdf')];
  const docs = [{ fileId: f1, label: 'GST registration certificate' }, { fileId: f2, label: 'PAN card' }];

  assert.equal((await call('PUT', '/verification', { token: co.token, body: { gstin: '27AAPFU0939F1ZX', pan: 'AAPFU0939F' } })).status, 400, 'a wrong check digit is caught');
  assert.equal((await call('PUT', '/verification', { token: co.token, body: { gstin: '27AAPFU0939F1ZV', pan: 'ZZZZZ9999Z' } })).status, 400, 'the PAN must match the GSTIN');
  assert.equal((await call('PUT', '/verification', { token: co.token, body: { gstin: '27AAPFU0939F1ZV', pan: 'AAPFU0939F', documents: [{ fileId: '0123456789abcdef01234567', label: 'x' }] } })).status, 400, 'documents must be your own uploads');
  assert.equal((await call('POST', '/verification/submit', { token: co.token })).status, 400, 'nothing saved yet');

  await new Promise(r => setTimeout(r, 2600)); // uploads leave quarantine
  const saved = await call('PUT', '/verification', { token: co.token, body: { gstin: '27AAPFU0939F1ZV', pan: 'AAPFU0939F', documents: docs } });
  assert.equal(saved.status, 200, JSON.stringify(saved.data));
  assert.equal((await call('POST', '/verification/submit', { token: co.token })).status, 200);
  assert.equal((await call('PUT', '/verification', { token: co.token, body: { gstin: '27AAPFU0939F1ZV', pan: 'AAPFU0939F' } })).status, 409, 'no edits while under review');

  assert.equal((await call('GET', '/verification/admin/queue', { token: co.token })).status, 403);
  assert.equal((await call('POST', `/verification/admin/${co.session.orgId}/approve`, { token: co.token, body: {} })).status, 403, 'a company cannot verify itself');
  const admin = await loginDemo('admin@realtyconnect.com');
  const queue = (await call('GET', '/verification/admin/queue', { token: admin.token })).data;
  const entry = queue.find(q => q.orgId === co.session.orgId);
  assert.ok(entry && entry.documents.length === 2);
  // the reviewer can open the documents
  const doc = await fetch(API + `/files/${f1}/download`, { headers: { Authorization: `Bearer ${admin.token}` } });
  assert.equal(doc.status, 200);

  assert.equal((await call('POST', `/verification/admin/${co.session.orgId}/reject`, { token: admin.token, body: { note: '' } })).status, 400, 'a rejection needs a reason');
  assert.equal((await call('POST', `/verification/admin/${co.session.orgId}/approve`, { token: admin.token, body: {} })).status, 200);
  const card = (await call('GET', '/companies')).data.find(c => c.id === co.session.orgId);
  assert.equal(card.verified, true);
  assert.equal(card.gstVerified, true);
  assert.equal((await call('GET', `/companies/${co.session.orgId}`, { token: co.token })).data.gstin, '27AAPFU0939F1ZV');
  assert.equal((await call('POST', '/auth/refresh', { cookie: co.cookie })).data.session.verified, true);
  // profile edits can no longer change verified identifiers
  await call('PUT', '/companies/me', { token: co.token, body: { gstin: '99AAAAA0000A1Z5', tagline: 'ok' } });
  assert.equal((await call('GET', `/companies/${co.session.orgId}`, { token: co.token })).data.gstin, '27AAPFU0939F1ZV');
});

test('blocking and reporting: blocked companies cannot make contact, reports reach a reviewer who can suspend', async () => {
  const a = await register('mod-a', 'MATERIAL_SUPPLIER'), b = await register('mod-b');
  const A = a.session.orgId, B = b.session.orgId;
  const message = (who, to) => call('POST', '/network/messages', { token: who.token, body: { toOrgId: to, conversationId: 'c-' + run, messageId: 'm-' + Math.random(), text: 'hello' } });

  assert.equal((await message(b, A)).status, 201);
  assert.equal((await call('POST', '/network/blocks', { token: a.token, body: { orgId: B } })).status, 201);
  assert.equal((await message(b, A)).status, 403, 'the blocked company cannot write');
  assert.equal((await message(a, B)).status, 403, 'and the blocker cannot either, until unblocked');
  assert.deepEqual((await call('GET', '/network/blocks', { token: a.token })).data, [B]);
  await call('DELETE', `/network/blocks/${B}`, { token: a.token });
  assert.equal((await message(b, A)).status, 201);

  const report = await call('POST', '/network/reports', { token: b.token, body: { orgId: A, reason: 'Spam', details: 'Sends unsolicited offers' } });
  assert.equal(report.status, 201);
  assert.equal((await call('GET', '/moderation/reports', { token: b.token })).status, 403);
  const admin = await loginDemo('admin@realtyconnect.com');
  const open = (await call('GET', '/moderation/reports', { token: admin.token })).data.find(r => r.id === report.data.id);
  assert.equal(open.reason, 'Spam');
  assert.ok(open.reported.startsWith('mod-a') && open.reporter.startsWith('mod-b'));
  assert.equal((await call('POST', `/moderation/reports/${report.data.id}/resolve`, { token: admin.token, body: { action: 'suspend', note: 'Repeated spam' } })).status, 200);
  assert.ok(!(await call('GET', '/companies')).data.some(c => c.id === A), 'a suspended company leaves the directory');
  assert.equal((await message(a, B)).status, 403, 'and cannot contact anyone');
  assert.equal((await call('POST', `/moderation/companies/${A}/restore`, { token: admin.token })).status, 200);
  assert.ok((await call('GET', '/companies')).data.some(c => c.id === A));
  assert.equal((await message(a, B)).status, 201);
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
