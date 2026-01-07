-- Ensure enum values for bids
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
    CREATE TYPE bid_status AS ENUM ('submitted', 'accepted', 'rejected', 'expired');
  ELSE
    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'bid_status'
        AND e.enumlabel = 'declined'
    ) THEN
      ALTER TYPE bid_status RENAME VALUE 'declined' TO 'rejected';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'bid_status'
        AND e.enumlabel = 'submitted'
    ) THEN
      ALTER TYPE bid_status ADD VALUE 'submitted';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'bid_status'
        AND e.enumlabel = 'accepted'
    ) THEN
      ALTER TYPE bid_status ADD VALUE 'accepted';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'bid_status'
        AND e.enumlabel = 'rejected'
    ) THEN
      ALTER TYPE bid_status ADD VALUE 'rejected';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'bid_status'
        AND e.enumlabel = 'expired'
    ) THEN
      ALTER TYPE bid_status ADD VALUE 'expired';
    END IF;
  END IF;
END $$;

DROP TABLE IF EXISTS public.bids CASCADE;

CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  creator_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  brand_user_id uuid NOT NULL REFERENCES public.brands(user_id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  message text,
  status bid_status NOT NULL DEFAULT 'submitted',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX bids_one_submitted_per_application
  ON public.bids (application_id)
  WHERE status = 'submitted';

CREATE INDEX bids_contract_id_idx ON public.bids (contract_id);
CREATE INDEX bids_brand_user_id_idx ON public.bids (brand_user_id);
CREATE INDEX bids_creator_user_id_idx ON public.bids (creator_user_id);
CREATE INDEX bids_application_id_idx ON public.bids (application_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_bids_updated_at ON public.bids;
CREATE TRIGGER set_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bids_select_creator"
  ON public.bids FOR SELECT
  USING (creator_user_id = auth.uid());

CREATE POLICY "bids_select_brand"
  ON public.bids FOR SELECT
  USING (brand_user_id = auth.uid());

CREATE POLICY "bids_insert_creator_approved"
  ON public.bids FOR INSERT
  WITH CHECK (
    creator_user_id = auth.uid()
    AND status = 'submitted'
    AND amount_cents > 0
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_id
        AND applications.creator_user_id = auth.uid()
        AND applications.status = 'approved_to_bid'
        AND applications.contract_id = contract_id
    )
    AND EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_id
        AND contracts.brand_user_id = brand_user_id
    )
  );

CREATE OR REPLACE FUNCTION public.bidding_submit_bid(
  application_id uuid,
  amount_cents int,
  message text
)
RETURNS public.bids
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application public.applications%ROWTYPE;
  v_contract public.contracts%ROWTYPE;
  v_bid public.bids%ROWTYPE;
BEGIN
  IF amount_cents IS NULL OR amount_cents <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT * INTO v_application FROM public.applications WHERE id = application_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application.creator_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_application.status <> 'approved_to_bid' THEN
    RAISE EXCEPTION 'Application not approved to bid';
  END IF;

  SELECT * INTO v_contract FROM public.contracts WHERE id = v_application.contract_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;

  INSERT INTO public.bids (
    contract_id,
    application_id,
    creator_user_id,
    brand_user_id,
    amount_cents,
    message,
    status
  )
  VALUES (
    v_application.contract_id,
    application_id,
    v_application.creator_user_id,
    v_contract.brand_user_id,
    amount_cents,
    message,
    'submitted'
  )
  RETURNING * INTO v_bid;

  RETURN v_bid;
END;
$$;

CREATE OR REPLACE FUNCTION public.bidding_reject_expired_bids()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.bids
  SET status = 'expired'
  WHERE status = 'submitted'
    AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.bidding_accept_bid(bid_id uuid)
RETURNS public.bids
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bid public.bids%ROWTYPE;
BEGIN
  SELECT * INTO v_bid FROM public.bids WHERE id = bid_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bid not found';
  END IF;

  IF v_bid.brand_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_bid.status <> 'submitted' THEN
    RETURN v_bid;
  END IF;

  IF v_bid.expires_at < now() THEN
    UPDATE public.bids
    SET status = 'expired'
    WHERE id = bid_id
      AND status = 'submitted';

    RAISE EXCEPTION 'Bid expired';
  END IF;

  UPDATE public.bids
  SET status = 'accepted'
  WHERE id = bid_id;

  UPDATE public.bids
  SET status = 'rejected'
  WHERE contract_id = v_bid.contract_id
    AND id <> bid_id
    AND status = 'submitted';

  SELECT * INTO v_bid FROM public.bids WHERE id = bid_id;
  RETURN v_bid;
END;
$$;

CREATE OR REPLACE FUNCTION public.bidding_reject_bid(bid_id uuid)
RETURNS public.bids
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bid public.bids%ROWTYPE;
BEGIN
  SELECT * INTO v_bid FROM public.bids WHERE id = bid_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bid not found';
  END IF;

  IF v_bid.brand_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_bid.status <> 'submitted' THEN
    RETURN v_bid;
  END IF;

  IF v_bid.expires_at < now() THEN
    UPDATE public.bids
    SET status = 'expired'
    WHERE id = bid_id
      AND status = 'submitted';
  ELSE
    UPDATE public.bids
    SET status = 'rejected'
    WHERE id = bid_id;
  END IF;

  SELECT * INTO v_bid FROM public.bids WHERE id = bid_id;
  RETURN v_bid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bidding_submit_bid(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bidding_reject_expired_bids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bidding_accept_bid(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bidding_reject_bid(uuid) TO authenticated;
