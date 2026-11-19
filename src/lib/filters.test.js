// Run with:  npm test
import test from 'node:test'
import assert from 'node:assert/strict'
import { applyView, evalGroup, groupRows, sortRows, addDays, countRules } from './filters.js'
import { buildProps } from './properties.js'

const props = buildProps('tasks', [{ id: 'x', entity: 'tasks', key: 'cf_a', label: 'Effort', type: 'select', sort_order: 0, options: [{ value: 'S' }, { value: 'L' }] }])
const propMap = Object.fromEntries(props.map((p) => [p.key, p]))
const stages = ['Not started', 'Editing', 'Approved'].map((value) => ({ value, label: value, color: '#fff' }))
const ctx = {
  propMap, meId: 'u1', today: '2026-11-19',
  optionsFor: (p) => (p.kind === 'stage' ? stages : (p.options || []).map((o) => ({ ...o, label: o.value }))),
  labelFor: (p, v) => String(v),
}
const rows = [
  { id: 1, title: 'A', stage: 'Editing', assigned_to: ['u1', 'u2'], deadline: '2026-11-10', rev_internal: 2, bounce_client: false, custom: { cf_a: 'L' } },
  { id: 2, title: 'B', stage: 'Approved', assigned_to: ['u2'], deadline: '2026-11-25', rev_internal: 0, bounce_client: true, custom: {} },
  { id: 3, title: 'C', stage: null, assigned_to: [], deadline: null, rev_internal: 5, bounce_client: false, custom: { cf_a: 'S' } },
]
const run = (group) => rows.filter((r) => evalGroup(r, group, ctx)).map((r) => r.id)
const and = (...rules) => ({ op: 'and', rules })

test('text / select / multi / "me"', () => {
  assert.deepEqual(run(and({ prop: 'title', op: 'contains', value: 'b' })), [2])
  assert.deepEqual(run(and({ prop: 'stage', op: 'is', value: 'Editing' })), [1])
  assert.deepEqual(run(and({ prop: 'stage', op: 'is_not', value: 'Editing' })), [2, 3])
  assert.deepEqual(run(and({ prop: 'stage', op: 'any_of', value: ['Editing', 'Approved'] })), [1, 2])
  assert.deepEqual(run(and({ prop: 'stage', op: 'none_of', value: ['Approved'] })), [1, 3])
  assert.deepEqual(run(and({ prop: 'assigned_to', op: 'contains', value: '__me__' })), [1])
  assert.deepEqual(run(and({ prop: 'assigned_to', op: 'is_empty' })), [3])
})

test('dates, numbers, checkbox, custom property', () => {
  assert.deepEqual(run(and({ prop: 'deadline', op: 'overdue' })), [1])
  assert.deepEqual(run(and({ prop: 'deadline', op: 'next_days', value: 10 })), [2])
  assert.deepEqual(run(and({ prop: 'deadline', op: 'past_days', value: 30 })), [1])
  assert.deepEqual(run(and({ prop: 'rev_internal', op: 'gte', value: 2 })), [1, 3])
  assert.deepEqual(run(and({ prop: 'bounce_client', op: 'checked' })), [2])
  assert.deepEqual(run(and({ prop: 'cf_a', op: 'is', value: 'L' })), [1])
})

test('AND / OR / nested groups, incomplete rules ignored', () => {
  assert.deepEqual(run({ op: 'or', rules: [{ prop: 'stage', op: 'is', value: 'Approved' }, { prop: 'title', op: 'is', value: 'C' }] }), [2, 3])
  assert.deepEqual(run(and({ prop: 'stage', op: 'is', value: '' })), [1, 2, 3])
  const nested = and({ prop: 'rev_internal', op: 'gt', value: 0 }, { group: { op: 'or', rules: [{ prop: 'stage', op: 'is', value: 'Editing' }, { prop: 'title', op: 'is', value: 'C' }] } })
  assert.deepEqual(run(nested), [1, 3])
  assert.equal(countRules(nested), 3)
})

test('sort puts empties last; select sorts by option order', () => {
  assert.deepEqual(sortRows(rows, [{ prop: 'deadline', dir: 'asc' }], ctx).map((r) => r.id), [1, 2, 3])
  assert.deepEqual(sortRows(rows, [{ prop: 'deadline', dir: 'desc' }], ctx).map((r) => r.id), [2, 1, 3])
  assert.deepEqual(sortRows(rows, [{ prop: 'stage', dir: 'desc' }], ctx).map((r) => r.id), [2, 1, 3])
})

test('group keeps option order and adds empty bucket', () => {
  const g = groupRows(rows, propMap.stage, ctx, { showEmpty: true })
  assert.deepEqual(g.map((x) => [x.key, x.rows.length]), [['Not started', 0], ['Editing', 1], ['Approved', 1], ['__empty__', 1]])
})

test('applyView combines filter + search + sort; addDays handles month ends', () => {
  const r = applyView(rows.map((x) => ({ ...x, _search: x.title.toLowerCase() })), { filter: and({ prop: 'rev_internal', op: 'gt', value: 0 }), sort: [{ prop: 'rev_internal', dir: 'desc' }] }, ctx, 'c')
  assert.deepEqual(r.map((x) => x.id), [3])
  assert.equal(addDays('2026-11-30', 1), '2026-12-01')
})
