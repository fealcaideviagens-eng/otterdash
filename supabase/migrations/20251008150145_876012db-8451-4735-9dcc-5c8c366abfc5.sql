-- Remove the plain-text password column from client table
-- This is a critical security fix as passwords should only be stored
-- in auth.users with proper hashing by Supabase Auth
ALTER TABLE public.client DROP COLUMN IF EXISTS senha;

-- Add DELETE policy to allow users to delete their own profiles
-- This ensures GDPR compliance and gives users control over their data
CREATE POLICY "Users can delete their own profile"
ON public.client
FOR DELETE
TO authenticated
USING (auth.uid() = id);