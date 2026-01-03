-- Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('submitted', 'approved_to_bid', 'rejected');
  END IF;
END $$;

-- Tables
CREATE TABLE saved_contracts (
  creator_user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (creator_user_id, contract_id)
);

CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  creator_user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  pitch text NOT NULL,
  status application_status NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  UNIQUE (contract_id, creator_user_id)
);

-- RLS
ALTER TABLE saved_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- saved_contracts policies
CREATE POLICY "saved_contracts_select_own"
  ON saved_contracts FOR SELECT
  USING (auth.uid() = creator_user_id);

CREATE POLICY "saved_contracts_insert_own"
  ON saved_contracts FOR INSERT
  WITH CHECK (
    auth.uid() = creator_user_id
    AND EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = contract_id
      AND contracts.status = 'live'
    )
  );

CREATE POLICY "saved_contracts_delete_own"
  ON saved_contracts FOR DELETE
  USING (auth.uid() = creator_user_id);

-- applications policies
CREATE POLICY "applications_select_creator_or_brand"
  ON applications FOR SELECT
  USING (
    creator_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = applications.contract_id
      AND contracts.brand_user_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_creator_live"
  ON applications FOR INSERT
  WITH CHECK (
    creator_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = applications.contract_id
      AND contracts.status = 'live'
    )
  );

CREATE POLICY "applications_update_brand_status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = applications.contract_id
      AND contracts.brand_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = applications.contract_id
      AND contracts.brand_user_id = auth.uid()
    )
  );
