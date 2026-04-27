-- 摇摆志 Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 decisions 表
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quick', 'deep')),
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reviewed')),
  selected_option TEXT DEFAULT '',
  satisfaction TEXT DEFAULT '' CHECK (satisfaction IN ('satisfied', 'neutral', 'regret', '')),
  review TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_decisions_user_id ON decisions(user_id);
CREATE INDEX idx_decisions_created_at ON decisions(created_at DESC);

-- 2. 创建 decision_options 表
CREATE TABLE decision_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  pros TEXT DEFAULT '',
  cons TEXT DEFAULT '',
  risks TEXT DEFAULT '',
  worst_case TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_decision_options_decision_id ON decision_options(decision_id);

-- 3. 启用 Row Level Security
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_options ENABLE ROW LEVEL SECURITY;

-- 4. decisions 表的 RLS 策略
CREATE POLICY "Users can view own decisions"
  ON decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON decisions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions"
  ON decisions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. decision_options 表的 RLS 策略
CREATE POLICY "Users can manage own decision options"
  ON decision_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM decisions
      WHERE decisions.id = decision_options.decision_id
      AND decisions.user_id = auth.uid()
    )
  );
