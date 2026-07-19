import { useState } from 'react';
import { LoaderCircle, LogOut, Phone, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const mask = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers.length > 10
    ? numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    : numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
};

export function CompleteProfile() {
  const { session, profile, refreshProfile, signOut } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) return toast.error('Informe um telefone válido.');
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ phone, updated_at: new Date().toISOString() }).eq('id', profile?.id);
    if (error) toast.error(error.message);
    else {
      await refreshProfile();
      toast.success('Cadastro concluído.');
    }
    setSaving(false);
  }

  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-violet-100 via-white to-fuchsia-50 p-5">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white bg-white p-7 shadow-xl sm:p-9">
      <div className="grid size-14 place-items-center rounded-2xl bg-violet-600 text-white"><UserRound/></div>
      <h1 className="mt-6 text-2xl font-bold">Complete seu cadastro</h1>
      <p className="mt-2 text-sm text-slate-500">Confirme seu telefone para concluir o primeiro acesso.</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold">{profile?.full_name || session?.user.user_metadata?.full_name || 'Usuário'}</p>
        <p className="mt-1 text-sm text-slate-500">{profile?.email || session?.user.email}</p>
      </div>
      <label className="mt-5 block"><span className="label">Telefone ou WhatsApp</span><div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={20}/><input autoFocus required inputMode="tel" className="input pl-10" value={phone} onChange={e => setPhone(mask(e.target.value))} placeholder="(00) 00000-0000"/></div></label>
      <button disabled={saving} className="btn-primary mt-6 w-full">{saving && <LoaderCircle className="animate-spin" size={18}/>}Continuar</button>
      <button type="button" onClick={signOut} className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-slate-500"><LogOut size={16}/>Sair</button>
    </form>
  </main>;
}

export function AccessDenied() {
  const { session, signOut } = useAuth();
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><div className="card w-full max-w-md p-8 text-center"><h1 className="text-2xl font-bold">Acesso não autorizado</h1><p className="mt-3 text-sm text-slate-500">A conta {session?.user.email} foi autenticada pelo Google, mas não possui um perfil ativo neste sistema.</p><button className="btn-primary mt-6 w-full" onClick={signOut}>Voltar ao login</button></div></main>;
}
