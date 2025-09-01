-- Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Admin can manage admin users" ON public.admin_users;

-- Créer une fonction sécurisée pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Créer les nouvelles politiques utilisant la fonction sécurisée
CREATE POLICY "Admin users can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (public.is_admin_user());

-- Permettre aux utilisateurs authentifiés de voir leur propre entrée admin
CREATE POLICY "Users can view their own admin status" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);