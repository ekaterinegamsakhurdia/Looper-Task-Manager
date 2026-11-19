-- Add invite tracking column to employees
-- Run this in Supabase SQL Editor after 01_schema.sql

alter table employees
  add column if not exists invite_sent_at timestamptz;
