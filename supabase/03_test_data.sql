-- Synthetic test data. Safe to delete later (TRUNCATE the tables or re-run 01_schema.sql).

INSERT INTO employees (id, full_name, email, role, department) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Nutsa Shvelidze', 'nutsa@looper.test', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000002', 'Mariam Jimsheleishvili', 'mariam.j@looper.test', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000003', 'Anna Katsadze', 'anna@looper.test', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000004', 'Mariam Kobulashvili', 'mariam.k@looper.test', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000005', 'Ninuca Chkhaidze', 'ninuca@looper.test', 'Account Manager', 'DM'),
  ('e1000000-0000-0000-0000-000000000006', 'Tatia Ormotsadze', 'tatia@looper.test', 'Designer', 'Design'),
  ('e1000000-0000-0000-0000-000000000007', 'Mariam Kukhalashvili', 'mariam.kk@looper.test', 'Media Buyer', 'DM'),
  ('e1000000-0000-0000-0000-000000000008', 'Gvantsa Burkadze', 'gvantsa@looper.test', 'Media Buyer', 'DM'),
  ('e1000000-0000-0000-0000-000000000009', 'Giorgi Beridze', 'giorgi@looper.test', 'Motion Designer', 'Production'),
  ('e1000000-0000-0000-0000-000000000010', 'Nino Tsiklauri', 'nino@looper.test', 'Copywriter', 'Copy');

INSERT INTO clients (id, name, industry, tier, status, platforms, am_owner_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'კრესტონი', 'ბუღალტერია', 'Standard', 'Active', ARRAY['Facebook','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'ESB Group', 'სამშენებლო მასალები', 'Standard', 'Active', ARRAY['Instagram','Facebook','Meta Ads','Tik-Tok']::text[], 'e1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000003', 'Grande Group', 'სამშენებლო', 'Standard', 'Active', ARRAY['Instagram','Facebook','linkedin']::text[], 'e1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000004', 'Restaurant Istoria', 'რესტორანი', 'Standard', 'Active', ARRAY['Instagram','Facebook']::text[], 'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000005', 'აბანოთუბანი ჯგუფი', 'საინფორმაციო', 'Strategic', 'Active', ARRAY['Instagram','Tik-Tok','Facebook','YouTube']::text[], 'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000006', 'ტექინსპექტირება უსაფრთხოებისთვის', 'ტექინსპექტირება', 'Standard', 'Active', ARRAY['Instagram','Facebook']::text[], 'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000007', 'Chreli Abano', 'აბანო', 'Standard', 'Active', ARRAY['Facebook','Instagram']::text[], 'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000008', 'Kinge Erekles Bath', 'აბანო', 'Standard', 'Active', ARRAY['Instagram','Facebook']::text[], 'e1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000009', 'Domenebi.ge', 'ინტერნეტ სერვისი', 'Strategic', 'Active', ARRAY['Facebook','Meta Ads','Google Ads']::text[], 'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000010', 'Mkhatvrebi Developments (Gldani)', 'სამშენებლო', 'Strategic', 'Inactive', ARRAY['Facebook','Instagram','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000011', 'ავქსონი', 'სამშენებლო', 'Strategic', 'Inactive', ARRAY['Instagram','Tik-Tok','Facebook','YouTube','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000012', 'Contrust', 'სამშენებლო', 'Standard', 'Active', ARRAY['Facebook','Meta Ads','Instagram']::text[], 'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000013', 'Mkhatvrebi Developments (Gelovani)', 'სამშენებლო', 'Strategic', 'Active', ARRAY['Instagram','Facebook','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000014', 'Maudi Residence', 'სამშენებლო', 'Strategic', 'Active', ARRAY['Instagram','Tik-Tok','Facebook','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000015', 'Pillar Samgori', 'სამშენებლო', 'Strategic', 'Active', ARRAY['Instagram','Facebook','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000016', 'BrightRoad', 'სამშენებლო', 'Strategic', 'Active', ARRAY['Instagram','Facebook','Meta Ads']::text[], 'e1000000-0000-0000-0000-000000000006');

INSERT INTO ad_campaigns (id, name, client_id, am_owner_ids, advertiser_ids, status, start_date, end_date, budget, last_reported) VALUES
  (688, 'ვინ არის დომენის ინვესტორი?', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-11-12', NULL, NULL, NULL),
  (684, 'არ დაგავიწყდეს სტატუსი', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-11-12', NULL, NULL, '2026-11-15'),
  (763, 'დომენები - 4 სერვისი', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008','e1000000-0000-0000-0000-000000000007']::uuid[], 'Tasks Done', '2026-11-18', NULL, 2500, NULL),
  (687, 'ყველაფერი 1 სიტყვაში', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Tasks Done', '2026-11-24', NULL, NULL, NULL),
  (685, 'ახალი 7-ნიშნა დომენი', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Tasks Done', '2026-11-30', NULL, NULL, NULL),
  (474, 'დომენები - ქეისი', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Awaiting Tasks', '2026-10-16', NULL, NULL, NULL),
  (473, 'Cybersquatting', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Awaiting Tasks', '2026-10-16', NULL, NULL, NULL),
  (465, 'ვის უყვარს დომენი', 'c1000000-0000-0000-0000-000000000009', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Awaiting Tasks', '2026-10-19', NULL, NULL, NULL),
  (586, 'BRIGHT ROAD - შეიძინე პრეზიდენტი', 'c1000000-0000-0000-0000-000000000016', ARRAY['e1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-11-10', NULL, NULL, NULL),
  (585, 'BRIGHT ROAD - ბეტონის პროდუქცია', 'c1000000-0000-0000-0000-000000000016', ARRAY['e1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-11-05', NULL, NULL, NULL),
  (452, 'BRIGHT ROAD - ნასესხები მოგება', 'c1000000-0000-0000-0000-000000000016', ARRAY['e1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-10-06', NULL, 1200, '2026-10-14'),
  (376, 'BRIGHT ROAD - ბეტონის სიმტკიცე', 'c1000000-0000-0000-0000-000000000016', ARRAY['e1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-10-16', NULL, 1800, '2026-10-30'),
  (374, 'BRIGHT ROAD - ეკო პროექტი', 'c1000000-0000-0000-0000-000000000016', ARRAY['e1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-10-09', NULL, 900, '2026-11-12'),
  (410, 'ESB ვიდეო 1', 'c1000000-0000-0000-0000-000000000002', ARRAY['e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Live', '2026-10-28', NULL, 1800, '2026-11-08'),
  (411, 'ESB - პრომო', 'c1000000-0000-0000-0000-000000000002', ARRAY['e1000000-0000-0000-0000-000000000005']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Tasks Done', '2026-11-02', NULL, NULL, NULL),
  (420, 'ისტორია - საუზმე', 'c1000000-0000-0000-0000-000000000004', ARRAY['e1000000-0000-0000-0000-000000000003']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-11-01', NULL, 900, '2026-11-17'),
  (430, 'Maudi Residence - ჩასვლა', 'c1000000-0000-0000-0000-000000000014', ARRAY['e1000000-0000-0000-0000-000000000004']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000008']::uuid[], 'Live', '2026-10-20', NULL, 3000, '2026-10-25'),
  (435, 'Maudi Residence - ზაფხული', 'c1000000-0000-0000-0000-000000000014', ARRAY['e1000000-0000-0000-0000-000000000004']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Finished', '2026-08-01', '2026-09-30', 2500, '2026-09-28'),
  (440, 'Pillar Samgori - მაღალი სართულები', 'c1000000-0000-0000-0000-000000000015', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Live', '2026-10-05', NULL, 1500, '2026-10-12'),
  (450, 'Contrust - სარეკლამო პაკეტი', 'c1000000-0000-0000-0000-000000000012', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Awaiting Tasks', '2026-11-20', NULL, NULL, NULL),
  (455, 'მხატვრები - ლოკაცია', 'c1000000-0000-0000-0000-000000000013', ARRAY['e1000000-0000-0000-0000-000000000002']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Live', '2026-11-03', NULL, 1100, '2026-11-16'),
  (460, 'ავქსონი - პრეზენტაცია', 'c1000000-0000-0000-0000-000000000011', ARRAY['e1000000-0000-0000-0000-000000000004']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000007']::uuid[], 'Finished', '2026-06-01', '2026-08-15', 4000, '2026-08-10'),
  (470, 'ტექინსპექტირება - კიბერ', 'c1000000-0000-0000-0000-000000000006', ARRAY['e1000000-0000-0000-0000-000000000003']::uuid[], ARRAY['e1000000-0000-0000-0000-000000000008']::uuid[], 'Live', '2026-11-09', NULL, NULL, NULL);

SELECT setval(pg_get_serial_sequence('ad_campaigns', 'id'), (SELECT max(id) FROM ad_campaigns));

INSERT INTO briefs (id, title, client_id, campaign_id, am_owner_id, copywriter_id, status, brief_type, committed_task_count, content) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'ESB Group - ვიზუალი კამპანია', 'c1000000-0000-0000-0000-000000000002', 410, 'e1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000010', 'Design', 'Post/Design', 4, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000002', 'ESB Group - ვიდეო 1', 'c1000000-0000-0000-0000-000000000002', 410, 'e1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000010', 'Production', 'Video', 3, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000003', 'Domenebi - დომენები 4 სერვისი', 'c1000000-0000-0000-0000-000000000009', 763, 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000010', 'Production', 'Video', 6, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000004', 'Domenebi - Cybersquatting', 'c1000000-0000-0000-0000-000000000009', 473, 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000010', 'Copy', 'Post/Design', 3, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000005', 'BrightRoad - ბეტონის პროდუქცია', 'c1000000-0000-0000-0000-000000000016', 585, 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000010', 'Copy', 'Campaign', 5, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000006', 'BrightRoad - პრეზიდენტი', 'c1000000-0000-0000-0000-000000000016', 586, 'e1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000010', 'Design', 'Video', 3, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000007', 'Maudi Residence - ჩასვლა', 'c1000000-0000-0000-0000-000000000014', 430, 'e1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000010', 'Production', 'Campaign', 5, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000008', 'Restaurant Istoria - საუზმე', 'c1000000-0000-0000-0000-000000000004', 420, 'e1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000010', 'Design', 'Post/Design', 4, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000009', 'Contrust - 2 ეტაპი', 'c1000000-0000-0000-0000-000000000012', 450, 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000010', 'Copy', 'Campaign', 4, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000010', 'Pillar Samgori - მაღალი სართულები', 'c1000000-0000-0000-0000-000000000015', 440, 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000010', 'Done', 'Video', 2, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000011', 'მხატვრები - ლოკაცია', 'c1000000-0000-0000-0000-000000000013', 455, 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000010', 'Design', 'Story', 3, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000012', 'Grande Feed Post', 'c1000000-0000-0000-0000-000000000003', NULL, 'e1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000010', 'Copy', 'Post/Design', 2, 'Goal, audience, tone of voice, deliverables and reference links go here.'),
  ('b1000000-0000-0000-0000-000000000013', 'კრესტონი - ტრენინგი', 'c1000000-0000-0000-0000-000000000001', NULL, 'e1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000010', 'Archived', 'Video', 1, 'Goal, audience, tone of voice, deliverables and reference links go here.');

INSERT INTO tasks (title, brief_id, client_id, campaign_id, stage, priority, department, task_type, assigned_to, deadline, bounce_internal, bounce_client, rev_internal, rev_client) VALUES
  ('ESB Banner Set — Facebook', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 410, 'Designing', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-25', false, false, 0, 0),
  ('ESB Story Template', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 410, 'Internal Review', 'P3', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-28', false, false, 0, 0),
  ('ESB Carousel — Product Line', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 410, 'Sent to client', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-21', false, false, 0, 0),
  ('ESB Copy — Georgian', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 410, 'Not started', 'P4', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010']::uuid[], NULL, false, false, 0, 0),
  ('ESB Product Reel', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 410, 'Editing', 'P2', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-30', false, false, 0, 0),
  ('ESB Hero Video 30s', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 410, 'Motion', 'P1', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009','e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-22', false, false, 0, 0),
  ('Domenebi — Hero Video', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 763, 'Motion', 'P1', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-22', false, false, 0, 0),
  ('Domenebi — Reel 15s', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 763, 'Editing', 'P1', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-18', false, false, 0, 0),
  ('Domenebi — Story Ad Set', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 763, 'Designing', 'P2', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-24', false, false, 0, 0),
  ('Domenebi — Copy Headlines', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 763, 'Bounced', 'P1', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010']::uuid[], '2026-11-17', true, false, 2, 0),
  ('Domenebi — Thumbnails x6', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 763, 'Sent to client', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-21', false, false, 0, 0),
  ('Domenebi — Long-form Video', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 763, 'Approved', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], NULL, false, false, 0, 0),
  ('Cybersquatting — Explainer Copy', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000009', 473, 'Not started', 'P3', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010']::uuid[], '2026-11-27', false, false, 0, 0),
  ('Cybersquatting — Static Ads', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000009', 473, 'Designing', 'P3', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-26', false, false, 0, 0),
  ('BrightRoad — Key Visual', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000016', 585, 'Internal Review', 'P1', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-20', false, false, 1, 0),
  ('BrightRoad — Campaign Video', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000016', 585, 'Motion', 'P1', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009','e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-21', false, false, 0, 0),
  ('BrightRoad — Story Pack x4', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000016', 585, 'Not started', 'P3', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-28', false, false, 0, 0),
  ('BrightRoad — Site Shoot', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000016', 585, 'Filming', 'P2', 'Production', 'Photo', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-23', false, false, 0, 0),
  ('BrightRoad — Presentation Video', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000016', 586, 'Shoot Readiness', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-12-02', false, false, 0, 0),
  ('BrightRoad — Presentation Copy', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000016', 586, 'Delivered', 'P3', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010']::uuid[], NULL, false, false, 0, 0),
  ('Maudi — Hero Visual', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000014', 430, 'Delivered', 'P2', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], NULL, false, false, 0, 0),
  ('Maudi — Reel Edit', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000014', 430, 'Sent to client', 'P2', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-22', false, false, 0, 0),
  ('Maudi — Arrival Video', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000014', 430, 'Editing', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-26', false, false, 0, 0),
  ('Maudi — OOH Billboard', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000014', 430, 'Archive', 'P4', 'Design', 'OOH', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], NULL, false, false, 0, 0),
  ('Maudi — Story Pack', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000014', 430, 'Bounced', 'P2', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-19', false, true, 0, 1),
  ('Istoria — Feed Post x4', 'b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 420, 'Designing', 'P3', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-26', false, false, 0, 0),
  ('Istoria — Breakfast Reel', 'b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 420, 'Not started', 'P3', 'Production', 'Reel', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-12-01', false, false, 0, 0),
  ('Contrust — Phase 2 Video', 'b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000012', 450, 'Editing', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-24', false, false, 0, 0),
  ('Contrust — Story Pack', 'b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000012', 450, 'Not started', 'P3', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], NULL, false, false, 0, 0),
  ('Contrust — Headlines', 'b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000012', 450, 'Approved', 'P3', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010']::uuid[], NULL, false, false, 0, 0),
  ('Pillar — Shoot Plan', 'b1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000015', 440, 'Shoot Readiness', 'P2', 'Production', 'Photo', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-30', false, false, 0, 0),
  ('Pillar — Tower Walkthrough', 'b1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000015', 440, 'Delivered', 'P2', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], NULL, false, false, 0, 0),
  ('Mkhatvrebi — Location Story x3', 'b1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000013', 455, 'Designing', 'P2', 'Design', 'Story', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], '2026-11-25', false, false, 0, 0),
  ('Mkhatvrebi — Teaser', 'b1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000013', 455, 'Motion', 'P3', 'Production', 'Animation', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], '2026-11-29', false, false, 0, 0),
  ('Grande — LinkedIn Banner', 'b1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000003', NULL, 'Archive', 'P4', 'Design', 'Post/Design', ARRAY['e1000000-0000-0000-0000-000000000006']::uuid[], NULL, false, false, 0, 0),
  ('Grande — Feed Post Copy', 'b1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000003', NULL, 'Internal Review', 'P3', 'Copy', 'Copy', ARRAY['e1000000-0000-0000-0000-000000000010']::uuid[], '2026-11-20', false, false, 0, 0),
  ('Kreston — Training Video', 'b1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000001', NULL, 'Archive', 'P4', 'Production', 'Video', ARRAY['e1000000-0000-0000-0000-000000000009']::uuid[], NULL, false, false, 0, 0);

INSERT INTO revision_log (task_id, bounce_type, note, logged_by)
SELECT id, 'internal', 'Headlines are off-brand — rewrite with the new tone of voice.', 'e1000000-0000-0000-0000-000000000002'::uuid FROM tasks WHERE title = 'Domenebi — Copy Headlines'
UNION ALL SELECT id, 'internal', 'Legal flagged the claim in headline 3.', 'e1000000-0000-0000-0000-000000000002'::uuid FROM tasks WHERE title = 'Domenebi — Copy Headlines'
UNION ALL SELECT id, 'client', 'Client wants a calmer colour palette.', 'e1000000-0000-0000-0000-000000000004'::uuid FROM tasks WHERE title = 'Maudi — Story Pack'
UNION ALL SELECT id, 'internal', 'Logo too small in the top-left.', 'e1000000-0000-0000-0000-000000000006'::uuid FROM tasks WHERE title = 'BrightRoad — Key Visual';

INSERT INTO task_comments (task_id, author_id, body)
SELECT id, 'e1000000-0000-0000-0000-000000000002'::uuid, 'Please use the new brand fonts from the shared Drive folder.' FROM tasks WHERE title = 'ESB Banner Set — Facebook'
UNION ALL SELECT id, 'e1000000-0000-0000-0000-000000000006'::uuid, 'Done — waiting for the Georgian copy before finalizing.' FROM tasks WHERE title = 'ESB Banner Set — Facebook'
UNION ALL SELECT id, 'e1000000-0000-0000-0000-000000000005'::uuid, 'Client asked for the first 3 seconds to be punchier.' FROM tasks WHERE title = 'ESB Hero Video 30s';

-- Row counts (expected: 10 / 16 / 23 / 13 / 37)
SELECT 'employees' AS tbl, count(*) FROM employees
UNION ALL SELECT 'clients', count(*) FROM clients
UNION ALL SELECT 'ad_campaigns', count(*) FROM ad_campaigns
UNION ALL SELECT 'briefs', count(*) FROM briefs
UNION ALL SELECT 'tasks', count(*) FROM tasks;
