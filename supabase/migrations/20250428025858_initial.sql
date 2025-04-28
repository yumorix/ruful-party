-- Parties テーブル
CREATE TABLE parties (
  id TEXT PRIMARY KEY, -- ULID
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL, -- checkなし
  current_mode TEXT NOT NULL, -- checkなし
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Participants テーブル
CREATE TABLE participants (
  id TEXT PRIMARY KEY, -- ULID
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  participant_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL, -- checkなし
  access_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Votes テーブル
CREATE TABLE votes (
  id TEXT PRIMARY KEY, -- ULID
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  voted_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL, -- checkなし
  rank INTEGER NOT NULL, -- checkなし
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Party Settings テーブル
CREATE TABLE party_settings (
  id TEXT PRIMARY KEY, -- ULID
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  matching_rule JSONB NOT NULL,
  seating_layout JSONB NOT NULL,
  gender_rules JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Matches テーブル
CREATE TABLE matches (
  id TEXT PRIMARY KEY, -- ULID
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL, -- checkなし
  participant1_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  participant2_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  table_number INTEGER,
  seat_positions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seating Plans テーブル
CREATE TABLE seating_plans (
  id TEXT PRIMARY KEY, -- ULID
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- checkなし
  layout_data JSONB NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- インデックス
CREATE INDEX idx_participants_party_id ON participants(party_id);
CREATE INDEX idx_votes_party_id ON votes(party_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_voted_id ON votes(voted_id);
CREATE INDEX idx_matches_party_id ON matches(party_id);
CREATE INDEX idx_seating_plans_party_id ON seating_plans(party_id);
