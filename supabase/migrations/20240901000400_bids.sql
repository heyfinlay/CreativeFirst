-- Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
    CREATE TYPE bid_status AS ENUM ('submitted', 'accepted', 'declined', 'expired');
  END IF;
END $$;

-- Table
CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  creator_user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  price_cents int NOT NULL,
  timeline_days int NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  status bid_status NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  UNIQUE (contract_id, creator_user_id)
);

-- RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bids_select_creator_or_brand"
  ON bids FOR SELECT
  USING (
    creator_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = bids.contract_id
      AND contracts.brand_user_id = auth.uid()
    )
  );

CREATE POLICY "bids_insert_creator_approved"
  ON bids FOR INSERT
  WITH CHECK (
    creator_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM applications
      WHERE applications.contract_id = bids.contract_id
      AND applications.creator_user_id = auth.uid()
      AND applications.status = 'approved_to_bid'
    )
    AND EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = bids.contract_id
      AND contracts.status = 'live'
    )
  );

CREATE POLICY "bids_update_brand_status"
  ON bids FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = bids.contract_id
      AND contracts.brand_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = bids.contract_id
      AND contracts.brand_user_id = auth.uid()
    )
    AND (status <> 'accepted' OR expires_at > now())
  );
