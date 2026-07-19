import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Clock, LoaderCircle, Phone, UserRound } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import '../booking.css';
import '../mini-calendar.css';
import { MiniBookingCalendar } from '../components/MiniBookingCalendar';
import { ConfirmBookingModal } from '../components/ConfirmBookingModal';

const mask = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers.length > 10
    ? numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    : numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
};

export function PublicBooking() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerFound, setCustomerFound] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function refreshSlots(clearSelection = false) {
    if (!date) return;
    setLoading(true);
    const { data, error: loadError } = await supabase.rpc('available_booking_slots', { p_date: date });
    const available = (data || []).map((item: { slot: string }) => item.slot);
    setSlots(available);
    if (clearSelection) setTime('');
    else if (time && !available.includes(time)) {
      setTime('');
      setError('Este hor\u00e1rio acabou de ser reservado. Escolha outro.');
    }
    if (loadError) setError(loadError.message);
    setLoading(false);
  }

  useEffect(() => {
    if (!date) return;
    setError('');
    void refreshSlots(true);
  }, [date]);

  useEffect(() => {
    if (step !== 3 || !date) return;
    const timer = window.setInterval(() => { void refreshSlots(false); }, 8000);
    return () => window.clearInterval(timer);
  }, [step, date, time]);

  useEffect(() => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setCustomerFound(false);
      setLookingUp(false);
      return;
    }
    setLookingUp(true);
    const timer = window.setTimeout(async () => {
      const { data } = await supabase.rpc('lookup_customer_name', { p_phone: phone });
      if (typeof data === 'string' && data.trim()) {
        setName(data);
        setCustomerFound(true);
        setWelcomeOpen(true);
        window.setTimeout(() => {
          setWelcomeOpen(false);
          setStep(2);
        }, 1400);
      } else setCustomerFound(false);
      setLookingUp(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [phone]);

  function changePhone(value: string) {
    if (customerFound) setName('');
    setCustomerFound(false);
    setPhone(mask(value));
  }

  function next() {
    setError('');
    const nameParts = name.trim().split(/\s+/).filter(part => part.length >= 2);
    if (step === 1 && (nameParts.length < 2 || phone.replace(/\D/g, '').length < 10)) {
      setError('Informe nome e sobrenome, al\u00e9m de um telefone v\u00e1lido.');
      return;
    }
    if (step === 2 && !date) {
      setError('Escolha um dia para continuar.');
      return;
    }
    setStep(current => Math.min(3, current + 1));
  }

  async function submit() {
    setConfirmOpen(false);
    if (!time) return setError('Escolha um hor\u00e1rio dispon\u00edvel.');
    setSaving(true);
    setError('');
    const { error: bookingError } = await supabase.rpc('create_public_booking', {
      p_name: name,
      p_phone: phone,
      p_date: date,
      p_time: time,
    });
    if (bookingError) {
      setError(bookingError.message);
      setTime('');
      await refreshSlots(false);
    } else setDone(true);
    setSaving(false);
  }

  const chosen = date ? new Date(date + 'T12:00:00') : null;

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(restart, 3000);
    return () => window.clearTimeout(timer);
  }, [done]);

  function restart() {
    setStep(1);
    setName('');
    setPhone('');
    setCustomerFound(false);
    setDate('');
    setTime('');
    setSlots([]);
    setError('');
    setDone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <main className={'public-booking booking-step-' + step + ' min-h-screen bg-[#faf9ff] px-4 py-6 sm:py-12'}>
    {welcomeOpen && <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/45 p-5 backdrop-blur-sm"><div className="w-full max-w-xs rounded-3xl bg-white p-7 text-center shadow-2xl"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-500"><CheckCircle2 size={36}/></div><h2 className="mt-4 text-xl font-bold text-slate-900">Que bom ter voc&ecirc; de volta, {name.trim().split(' ')[0]}!</h2><p className="mt-2 text-sm text-slate-500">Encontramos seus dados. Vamos escolher o melhor dia.</p><div className="mx-auto mt-5 h-1 w-20 overflow-hidden rounded-full bg-violet-100"><div className="h-full w-full animate-pulse rounded-full bg-violet-600"/></div></div></div>}
    {confirmOpen && <ConfirmBookingModal date={chosen} time={time} loading={saving} onClose={() => setConfirmOpen(false)} onConfirm={submit}/>}
    {done && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-500"><CheckCircle2 size={44}/></div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-emerald-600">Tudo certo</p>
        <h2 className="mt-1 text-2xl font-bold">Agendamento conclu&iacute;do!</h2>
        <p className="mt-3 text-sm text-slate-500">Seu hor&aacute;rio foi reservado para <b className="text-slate-800">{chosen?.toLocaleDateString('pt-BR')}</b> &agrave;s <b className="text-slate-800">{time}</b>.</p>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm"><b>{name}</b><p className="mt-1 text-slate-500">{phone}</p></div>
        <p className="mt-6 text-sm font-semibold text-violet-600">Voltando ao in&iacute;cio...</p>
      </div>
    </div>}

    <div className="booking-shell mx-auto max-w-2xl">
      <header className="booking-header mb-7 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-bold text-white shadow-lg shadow-violet-200">K</div>
        <div className="mt-4 text-sm font-semibold text-violet-600">Kavelar Feminine Beaty</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Agende seu hor&aacute;rio</h1>
        <p className="mt-2 text-slate-500">&Eacute; r&aacute;pido e leva menos de um minuto.</p>
      </header>

      <section className="booking-card overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(30,20,70,.08)]">
        <div className="booking-progress border-b bg-slate-50/70 px-6 py-5">
          <div className="flex items-center gap-3">{[1, 2, 3].map((number, index) => <div key={number} className="contents"><div className={'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ' + (step >= number ? 'bg-violet-600 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200')}>{step > number ? <Check size={16}/> : number}</div>{index < 2 && <div className={'h-1 flex-1 rounded-full ' + (step > number ? 'bg-violet-500' : 'bg-slate-200')}/>}</div>)}</div>
          <div className="booking-progress-labels mt-2 flex justify-between text-[11px] font-medium text-slate-500"><span>Seus dados</span><span>Escolha o dia</span><span>Escolha a hora</span></div>
        </div>

        <div className="booking-content p-6 sm:p-8">
          {error && <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          {step === 1 && <div>
            <h2 className="text-xl font-bold">Vamos identificar voc&ecirc;</h2>
            <p className="mt-1 text-sm text-slate-500">Informe seu nome completo e WhatsApp para continuar.</p>
            <div className="mt-6 space-y-4">
              <label><span className="label">Nome completo</span><div className="relative"><UserRound className="absolute left-4 top-3.5 text-slate-400" size={19}/><input autoFocus className={'input h-12 pl-12 ' + (customerFound ? 'bg-emerald-50' : '')} value={name} onChange={event => setName(event.target.value)} placeholder="Digite seu nome"/></div></label>
              <label><span className="label">WhatsApp ou telefone</span><div className="relative"><Phone className="absolute left-4 top-3.5 text-slate-400" size={19}/><input className="input h-12 pl-12" inputMode="tel" value={phone} onChange={event => changePhone(event.target.value)} placeholder="(00) 00000-0000"/></div>{lookingUp&&<p className="mt-1 text-xs text-slate-400">Procurando seu cadastro...</p>}</label>
            </div>
          </div>}

          {step === 2 && <div><h2 className="text-xl font-bold">Qual o melhor dia?</h2><p className="mt-1 text-sm text-slate-500">Atendimento de ter&ccedil;a a s&aacute;bado.</p><MiniBookingCalendar value={date} onChange={setDate}/></div>}

          {step === 3 && <div>
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Escolha o hor&aacute;rio</h2><p className="mt-1 text-sm text-slate-500">{chosen?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><CalendarDays className="text-violet-500"/></div>
            {loading ? <div className="flex justify-center p-12 text-slate-500"><LoaderCircle className="mr-2 animate-spin"/>Atualizando hor&aacute;rios...</div> : !slots.length ? <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">N&atilde;o h&aacute; hor&aacute;rios livres neste dia.<button className="mt-2 block w-full font-semibold text-violet-600" onClick={() => setStep(2)}>Escolher outro dia</button></div> : <div className="booking-slots mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">{slots.map(slot => <button key={slot} aria-pressed={time === slot} onClick={() => setTime(slot)} className={'min-h-12 rounded-xl border font-semibold transition ' + (time === slot ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50')}><Clock className="mr-1 inline" size={15}/>{slot}</button>)}</div>}
            {time && <div className="mt-6 flex items-center justify-between rounded-2xl bg-violet-50 p-4"><div><p className="text-xs font-semibold uppercase text-violet-500">Seu hor&aacute;rio</p><b>{chosen?.toLocaleDateString('pt-BR')} &agrave;s {time}</b></div><CheckCircle2 className="text-violet-600"/></div>}
          </div>}

          <div className="booking-actions mt-8 flex gap-3">
            {step > 1 && <button className="btn-secondary px-4" onClick={() => { setError(''); setStep(current => current - 1); }}><ArrowLeft size={18}/></button>}
            <button disabled={saving || lookingUp} className="btn-primary flex-1" onClick={step === 3 ? () => setConfirmOpen(true) : next}>{saving ? <LoaderCircle className="animate-spin" size={18}/> : step === 3 ? 'Confirmar agendamento' : <>Continuar<ArrowRight size={18}/></>}</button>
          </div>
        </div>
      </section>
      <p className="booking-privacy mt-5 text-center text-xs text-slate-400">Seus dados s&atilde;o usados apenas para o atendimento.</p>
    </div>
  </main>;
}
