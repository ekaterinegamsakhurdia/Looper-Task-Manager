// Default saved views (tabs) per page. Property keys come from src/lib/properties.js.
// "__me__" in a filter means "whoever is selected in Viewing as / the signed-in person".
const AND = (...rules) => ({ op: 'and', rules })
const rule = (prop, op, value) => (value === undefined ? { prop, op } : { prop, op, value })

export const DEFAULT_VIEWS = {
  tasks: [
    { name: 'Board', config: {
        layout: 'board', groupBy: 'stage', filter: AND(), sort: [],
        cardProps: ['priority', 'client_id', 'assigned_to', 'deadline'] } },
    { name: 'My Tasks', config: {
        layout: 'table', filter: AND(rule('assigned_to', 'contains', '__me__')),
        sort: [{ prop: 'deadline', dir: 'asc' }],
        columns: ['title', 'stage', 'priority', 'client_id', 'brief_id', 'deadline'] } },
    { name: 'All Tasks', config: {
        layout: 'table', filter: AND(), sort: [{ prop: 'priority', dir: 'asc' }] } },
    { name: 'Overdue', config: {
        layout: 'table',
        filter: AND(rule('deadline', 'overdue'), rule('stage', 'none_of', ['Approved', 'Delivered', 'Archive'])),
        sort: [{ prop: 'deadline', dir: 'asc' }],
        columns: ['title', 'stage', 'priority', 'assigned_to', 'client_id', 'deadline'] } },
    { name: 'By Department', config: {
        layout: 'board', groupBy: 'department', filter: AND(), sort: [],
        cardProps: ['stage', 'priority', 'client_id', 'deadline'] } },
  ],
  briefs: [
    { name: 'All Briefs', config: { layout: 'table', filter: AND(), sort: [{ prop: 'created_at', dir: 'desc' }] } },
    { name: 'Board', config: { layout: 'board', groupBy: 'status', filter: AND(), sort: [],
        cardProps: ['client_id', 'brief_type', 'am_owner_id', 'count_check'] } },
    { name: 'With Copywriter', config: { layout: 'table', filter: AND(rule('status', 'is', 'Copy')), sort: [] } },
  ],
  clients: [
    { name: 'All Clients', config: { layout: 'table', filter: AND(), sort: [{ prop: 'name', dir: 'asc' }] } },
    { name: 'My Clients', config: { layout: 'table', filter: AND(rule('am_owner_id', 'is', '__me__')), sort: [{ prop: 'name', dir: 'asc' }] } },
    { name: 'Active', config: { layout: 'table', filter: AND(rule('status', 'is', 'Active')), sort: [{ prop: 'name', dir: 'asc' }] } },
    { name: 'By Tier', config: { layout: 'board', groupBy: 'tier', filter: AND(), sort: [],
        cardProps: ['am_owner_id', 'industry', 'platforms'] } },
  ],
  campaigns: [
    { name: 'Table', config: { layout: 'table', groupBy: 'client_id', filter: AND(), sort: [{ prop: 'start_date', dir: 'desc' }] } },
    { name: 'Board', config: { layout: 'board', groupBy: 'status', filter: AND(), sort: [],
        cardProps: ['client_id', 'advertiser_ids', 'start_date', 'report_state'] } },
    { name: 'My Campaigns', config: { layout: 'table', groupBy: 'client_id',
        filter: { op: 'or', rules: [rule('am_owner_ids', 'contains', '__me__'), rule('advertiser_ids', 'contains', '__me__')] },
        sort: [{ prop: 'start_date', dir: 'desc' }] } },
    { name: 'Report Due', config: { layout: 'table', filter: AND(rule('report_state', 'is', 'Report due')), sort: [{ prop: 'last_reported', dir: 'asc' }] } },
    { name: 'Finished Campaigns', config: { layout: 'table', filter: AND(rule('status', 'is', 'Finished')), sort: [{ prop: 'end_date', dir: 'desc' }] } },
  ],
}
