import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import type { Profile } from '../types';

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId?: string) => {
    const id = userId || session?.user.id;
    if (!id) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    setProfile(data as Profile | null);
  }, [session?.user.id]);

  useEffect(() => {
    const load = async (nextSession: Session | null) => {
      setSession(nextSession);
      if (nextSession) {
        const { data } = await supabase.from('profiles').select('*').eq('id', nextSession.user.id).maybeSingle();
        setProfile(data as Profile | null);
      } else setProfile(null);
      setLoading(false);
    };
    void supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => { void load(nextSession); });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{
    session,
    profile,
    loading,
    refreshProfile: () => fetchProfile(),
    signOut: async () => { await supabase.auth.signOut(); },
  }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
