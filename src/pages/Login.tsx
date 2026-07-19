import { useEffect, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { session } = useAuth();
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false), [googleBusy, setGoogleBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { const p = new URLSearchParams(window.location.hash.slice(1)); const d = p.get('error_description'); if (d) setError(decodeURIComponent(d.replace(/\+/g, ' '))); }, []);
  if (session) return <Navigate to="/" replace/>;

  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); const { error: err } = await supabase.auth.signInWithPassword({ email, password }); if (err) setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : err.message); setBusy(false); }
  async function google() { setGoogleBusy(true); setError(''); const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); if (err) { setError(err.message); setGoogleBusy(false); } }

  return <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
    <section className="hidden bg-gradient-to-br from-violet-700 to-fuchsia-600 p-14 text-white lg:flex lg:flex-col lg:justify-between"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-white/20 text-xl font-bold">K</div><b className="text-xl">Kavelar Feminine Beaty</b></div><div><h1 className="max-w-lg text-5xl font-bold leading-tight">Finanças em ordem. Salão crescendo.</h1><p className="mt-5 max-w-md text-lg text-violet-100">Acompanhe caixa, receitas, despesas e comissões em um só lugar.</p></div><p className="text-sm text-violet-200">Seguro, rápido e feito para a rotina do seu salão.</p></section>
    <section className="flex items-center justify-center p-5"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-soft md:p-10">
      <div className="mb-8 lg:hidden"><div className="grid size-12 place-items-center rounded-2xl bg-violet-600 text-xl font-bold text-white">K</div></div><h2 className="text-3xl font-bold">Acesse sua conta</h2><p className="mt-2 text-slate-500">Entre com Google ou informe seus dados.</p>
      {error&&<div className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <button type="button" disabled={googleBusy} onClick={google} className="btn-secondary mt-7 w-full">{googleBusy?<LoaderCircle className="animate-spin" size={18}/>:<span className="grid size-5 place-items-center rounded-full bg-white font-bold text-blue-600">G</span>}Continuar com Google</button>
      <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-400"><div className="h-px flex-1 bg-slate-200"/><span>ou entre com e-mail</span><div className="h-px flex-1 bg-slate-200"/></div>
      <label className="block"><span className="label">E-mail</span><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={20}/><input className="input pl-10" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@salao.com" required/></div></label>
      <label className="mt-4 block"><span className="label">Senha</span><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={20}/><input className="input px-10" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" required/><button type="button" aria-label="Mostrar senha" className="absolute right-3 top-3 text-slate-400" onClick={()=>setShow(!show)}>{show?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>
      <button type="button" className="my-4 text-sm font-semibold text-violet-700" onClick={async()=>{if(!email)return setError('Informe seu e-mail primeiro.');await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});setError('Enviamos as instruções para o seu e-mail.')}}>Esqueci minha senha</button>
      <button disabled={busy} className="btn-primary w-full">{busy&&<LoaderCircle className="animate-spin" size={18}/>}Entrar</button>
    </form></section>
  </main>;
}
