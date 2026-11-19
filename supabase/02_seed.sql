-- ============================================================
-- Looper Tasks — Seed Data v2
-- Run AFTER 01_schema.sql
-- NOTE: auth.users must be created manually in Supabase Auth
--       using the same emails below (password: Looper2024!)
-- ============================================================

-- ── Employees ────────────────────────────────────────────────
INSERT INTO employees (id, full_name, email, role, department) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Nutsa Shvelidze',       'nutsa@looperagency.ge',    'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000002', 'Mariam Jimsheleishvili','mariam.j@looperagency.ge', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000003', 'Anna Katsadze',         'anna@looperagency.ge',     'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000004', 'Mariam Kobulashvili',   'mariam.k@looperagency.ge', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000005', 'Ninuca Chkhaidze',      'ninuca@looperagency.ge',   'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000006', 'Tatia Ormotsadze',      'tatia@looperagency.ge',    'Designer',        'Design'),
  ('e1000000-0000-0000-0000-000000000007', 'Mariam Kukhalashvili',  'mariamk@looperagency.ge',  'Media Buyer',     'DM'),
  ('e1000000-0000-0000-0000-000000000008', 'Gvantsa Burkadze',      'gvantsa@looperagency.ge',  'Media Buyer',     'DM'),
  ('e1000000-0000-0000-0000-000000000009', 'Giorgi Beridze',        'giorgi@looperagency.ge',   'Motion Designer', 'Production'),
  ('e1000000-0000-0000-0000-000000000010', 'Nino Tsiklauri',        'nino@looperagency.ge',     'Copywriter',      'Copy');

-- ── Clients ──────────────────────────────────────────────────
INSERT INTO clients (id, name, industry, tier, status, platforms, am_owner_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'ESB Group',           'სამშენებლო მასალები', 'Standard',  'Active',   ARRAY['Instagram','Facebook','Meta Ads','Tik-Tok'],   'e1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000002', 'Domenebi.ge',         'ინტერნეტ სერვისი',    'Strategic', 'Active',   ARRAY['Facebook','Meta Ads','Google Ads'],             'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000003', 'Maudi Residence',     'სამშენებლო',          'Strategic', 'Active',   ARRAY['Instagram','Facebook','Meta Ads','Tik-Tok'],   'e1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000004', 'BrightRoad',          'სამშენებლო',          'Strategic', 'Active',   ARRAY['Instagram','Facebook','Meta Ads'],              'e1000000-0000-0000-0000-000000000006'),
  ('c1000000-0000-0000-0000-000000000005', 'Contrust',            'სამშენებლო',          'Standard',  'Active',   ARRAY['Facebook','Meta Ads','Instagram'],              'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000006', 'Restaurant Istoria',  'რესტორანი',           'Standard',  'Active',   ARRAY['Instagram','Facebook'],                        'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000007', 'Grande Group',        'სამშენებლო',          'Standard',  'Active',   ARRAY['Instagram','Facebook','LinkedIn'],              'e1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000008', 'Pillar Samgori',      'სამშენებლო',          'Strategic', 'Active',   ARRAY['Instagram','Facebook','Meta Ads'],              'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000009', 'Chreli Abano',        'აბანო',               'Standard',  'Active',   ARRAY['Facebook','Instagram'],                        'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000010', 'Kinge Erekles Bath',  'აბანო',               'Standard',  'Active',   ARRAY['Instagram','Facebook'],                        'e1000000-0000-0000-0000-000000000003');

-- ── Ad Campaigns ─────────────────────────────────────────────
INSERT INTO ad_campaigns (id, name, client_id, am_owner_id, advertiser_id, status, start_date, budget, report_status, last_reported) VALUES
  (688, 'ვინ არის ლომდენის ინსტექტირება?', 'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-11-12', NULL,     NULL,      NULL),
  (684, 'არ დაღაქსრის სტვამ',              'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-11-12', NULL,     NULL,      NULL),
  (763, 'ლომდენი - 4 სერვისი',             'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Tasks Done',    '2026-11-18', 2500.00,  NULL,      NULL),
  (687, 'ყვავლავური 1 სერვისი',            'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Tasks Done',    '2026-11-24', NULL,     NULL,      NULL),
  (685, 'ახალი 7-ნი8ნა ლომდენი',          'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Tasks Done',    '2026-11-30', NULL,     NULL,      NULL),
  (474, 'ლომდენი - ქველი',                 'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Awaiting Tasks','2026-10-16', NULL,     NULL,      NULL),
  (473, 'Cybersquatting',                   'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Awaiting Tasks','2026-10-16', NULL,     NULL,      NULL),
  (465, 'ვის უყვარის ლომდენი',             'c1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Awaiting Tasks','2026-10-18', NULL,     NULL,      NULL),
  (586, 'BRIGHT ROAD - შაიდინერ პრეზიმუ', 'c1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-11-10', NULL,     NULL,      NULL),
  (585, 'BRIGHT ROAD - ბეტონის პრომო',    'c1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-11-05', NULL,     NULL,      NULL),
  (452, 'BRIGHT ROAD - ნასხმის მოუწები',  'c1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-10-06', NULL,     NULL,      NULL),
  (376, 'BRIGHT ROAD - Bright Road-ის',   'c1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-10-16', NULL,     NULL,      NULL),
  (374, 'BRIGHT ROAD - Bright Road ეკო',  'c1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-10-09', NULL,     NULL,      NULL),
  (500, 'Maudi Residence - ზაფხული',      'c1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-11-01', 3000.00,  NULL,      '2026-10-28'),
  (501, 'Pillar Samgori - მაისი',         'c1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000007', 'Live',          '2026-10-15', 1500.00,  NULL,      NULL);

-- ── Briefs ───────────────────────────────────────────────────
INSERT INTO briefs (id, title, client_id, campaign_id, am_owner_id, status, brief_type, committed_task_count) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'ESB Group - ვიზუალი', 'c1000000-0000-0000-0000-000000000001', NULL, 'e1000000-0000-0000-0000-000000000005', 'Design', 'Post/Design', 4),
  ('b1000000-0000-0000-0000-000000000002', 'Domenebi - ლომდენი Campaign', 'c1000000-0000-0000-0000-000000000002', 763, 'e1000000-0000-0000-0000-000000000002', 'Production', 'Video', 6),
  ('b1000000-0000-0000-0000-000000000003', 'BrightRoad - ბეტონი Brief', 'c1000000-0000-0000-0000-000000000004', 585, 'e1000000-0000-0000-0000-000000000006', 'Copy', 'Campaign', 8),
  ('b1000000-0000-0000-0000-000000000004', 'Maudi Residence - ზაფხული', 'c1000000-0000-0000-0000-000000000003', 500, 'e1000000-0000-0000-0000-000000000004', 'Production', 'Campaign', 5),
  ('b1000000-0000-0000-0000-000000000005', 'Restaurant Istoria - საუჟმი', 'c1000000-0000-0000-0000-000000000006', NULL, 'e1000000-0000-0000-0000-000000000003', 'Design', 'Post/Design', 3),
  ('b1000000-0000-0000-0000-000000000006', 'Contrust - 2 ეტაპი', 'c1000000-0000-0000-0000-000000000005', NULL, 'e1000000-0000-0000-0000-000000000002', 'Copy', 'Campaign', 4);

-- ── Tasks ────────────────────────────────────────────────────
INSERT INTO tasks (title, brief_id, client_id, stage, priority, department, task_type, assigned_to, deadline) VALUES
  -- ESB Group
  ('ESB Banner Set - Facebook', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Designing', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-25'),
  ('ESB Story Template', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Internal Review', 'P3', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-28'),
  ('ESB Product Reel', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Editing', 'P2', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-30'),
  ('ESB Copy - Georgian', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Not started', 'P4', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010'::uuid], NULL),
  -- Domenebi
  ('Domenebi - ლომდენი Hero Video', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Motion', 'P1', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-22'),
  ('Domenebi - Reel 15s', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Editing', 'P1', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-22'),
  ('Domenebi - Story Ad Set', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Designing', 'P2', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-24'),
  ('Domenebi - Copy Headlines', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Bounced', 'P1', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010'::uuid], '2026-11-20'),
  ('Domenebi - Thumbnail x6', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Sent to client', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-21'),
  ('Domenebi - Long-form Video', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Approved', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], NULL),
  -- BrightRoad
  ('BrightRoad - ბეტონი Key Visual', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'Internal Review', 'P1', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-20'),
  ('BrightRoad - Campaign Video', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'Motion', 'P1', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-21'),
  ('BrightRoad - Story Pack x4', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'Not started', 'P3', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-28'),
  -- Maudi
  ('Maudi Residence - Hero Visual', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Delivered', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], NULL),
  ('Maudi Residence - Reel Edit', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Sent to client', 'P2', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-22'),
  -- Istoria
  ('Istoria Feed Post x4', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000006', 'Designing', 'P3', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], '2026-11-26'),
  -- Contrust
  ('Contrust - Phase 2 Video', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 'Editing', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-24'),
  ('Contrust - Story Pack', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 'Not started', 'P3', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006'::uuid], NULL),
  -- Archive / other stages
  ('Grande Group - LinkedIn Banner', NULL, 'c1000000-0000-0000-0000-000000000007', 'Archive', 'P4', 'Design', 'Post/Design', '{}', NULL),
  ('Pillar Samgori - Shoot Plan', NULL, 'c1000000-0000-0000-0000-000000000008', 'Shoot Readiness', 'P2', 'Production', 'Photo', ARRAY['e1000000-0000-0000-0000-000000000009'::uuid], '2026-11-30');

-- ── Bounce one task for demo ──────────────────────────────────
UPDATE tasks SET bounce_internal = TRUE, rev_internal = 1 WHERE title = 'Domenebi - Copy Headlines';
INSERT INTO revision_log (task_id, bounce_type, note, logged_by)
SELECT id, 'internal', 'Headlines not on-brand, rewrite needed', 'e1000000-0000-0000-0000-000000000002'
FROM tasks WHERE title = 'Domenebi - Copy Headlines';

-- ── Sample comments ───────────────────────────────────────────
INSERT INTO task_comments (task_id, author_id, body)
SELECT t.id, 'e1000000-0000-0000-0000-000000000002', 'Please use the new brand fonts from the shared Drive folder.'
FROM tasks t WHERE t.title = 'ESB Banner Set - Facebook';

INSERT INTO task_comments (task_id, author_id, body)
SELECT t.id, 'e1000000-0000-0000-0000-000000000006', 'Done — waiting for copy before finalizing.'
FROM tasks t WHERE t.title = 'ESB Banner Set - Facebook';
