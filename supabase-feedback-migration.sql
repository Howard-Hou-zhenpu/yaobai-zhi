-- Feedback table for 摇摆志 (Yaobai Zhi) product feedback system
-- Run this SQL in Supabase SQL Editor before using the feedback form

-- Create feedback table
create table feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating text not null check (rating in ('helpful', 'neutral', 'not_helpful')),
  feature text,
  feedback_type text not null,
  message text not null check (char_length(message) >= 5),
  contact text,
  source_page text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'planned', 'shipped', 'ignored')),
  internal_note text
);

-- Enable Row Level Security
alter table feedback enable row level security;

-- Policy: Anonymous users can only insert feedback
-- This allows the frontend (using anon key) to submit feedback
-- but prevents reading/updating/deleting feedback from the frontend
create policy "anon_insert_feedback"
  on feedback
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policies for anon role
-- Admin can view feedback directly in Supabase dashboard using service role
-- This prevents exposing service role key to frontend

-- Optional: Create indexes for common queries (admin use)
create index feedback_created_at_idx on feedback(created_at desc);
create index feedback_status_idx on feedback(status);
create index feedback_rating_idx on feedback(rating);
