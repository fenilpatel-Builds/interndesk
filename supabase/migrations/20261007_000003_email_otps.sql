-- ==============================================================================
-- InternDesk: 6-Digit Email OTP Storage & Verification Engine
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON public.email_otps(email, otp_code, consumed);

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Allow service_role to manage OTPs freely
DROP POLICY IF EXISTS "Service role full access email_otps" ON public.email_otps;
CREATE POLICY "Service role full access email_otps"
ON public.email_otps FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
