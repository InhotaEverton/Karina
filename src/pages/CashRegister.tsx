import { useEffect, useState } from 'react';
import { ArrowDown, LockKeyhole, Plus, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { money } from '../lib/format';
import { Empty, Loading } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

type Cash = { id: string; opened_at: string; initial_balance: number; expected_balance: number; status: string };
type Move = { id: string; type: string; description: string; amount: number; created_at: string };
type Option = { id: string; name: string };

export function CashRegister() {
  const { profile } = useAuth();
  const [cash, setCash] = useState<Cash | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [methods, setMethods] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [expense, setExpense] = useState({ category: '', description: '', amount: 0, paymentMethod: '' });

  async function load() {
    setLoading(true);
    const [{ data: openCash, error }, { data: cats }, { data: paymentMethods }] = await Promise.all([
      supabase.from('cash_registers').select('*').eq('status', 'open').maybeSingle(),
      supabase.from('financial_categories').select('id,name').eq('type', 'expense').eq('active', true).order('name'),
      supabase.from('payment_methods').select('id,name').eq('active', true).order('name'),
    ]);
    if (error) toast.error(error.message);
    setCash(openCash);
    setCategories(cats || []);
    setMethods(paymentMethods || []);
    if (openCash) {
      const { data } = await supabase.from('cash_movements').select('*').eq('cash_register_id', openCash.id).order('created_at', { ascending: false });
      setMoves(data || []);
    } else setMoves([]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function openCash(e: React.FormEvent) {
    e.preventDefault();
    if (initialBalance < 0) return toast.error('O saldo inicial não pode ser negativo');
    const { error } = await supabase.from('cash_registers').insert({
      opened_by: profile?.id, initial_balance: initialBalance, expected_balance: initialBalance, status: 'open',
    });
    if (error) toast.error(error.message);
    else { toast.success('Caixa do dia aberto'); setOpening(false); void load(); }
  }

  function showExpense() {
    setExpense({
      category: categories[0]?.id || '',
      description: '',
      amount: 0,
      paymentMethod: methods[0]?.id || '',
    });
    setExpenseOpen(true);
  }

  async function saveExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!expense.category || !expense.description.trim() || expense.amount <= 0) return toast.error('Preencha categoria, descrição e valor');
    const { error } = await supabase.rpc('register_cash_expense', {
      p_category: expense.category,
      p_description: expense.description.trim(),
      p_amount: expense.amount,
      p_payment_method: expense.paymentMethod || null,
    });
    if (error) toast.error(error.message);
    else { toast.success('Saída registrada nas despesas e no caixa'); setExpenseOpen(false); void load(); }
  }

  async function closeCash() {
    if (!cash) return;
    const raw = prompt(`Saldo esperado: ${money.format(cash.expected_balance)}\nInforme o saldo contado:`);
    if (raw === null) return;
    const informed = Number(raw.replace(',', '.'));
    if (!Number.isFinite(informed) || informed < 0) return toast.error('Informe um saldo válido');
    const { error } = await supabase.from('cash_registers').update({
      status: 'closed', closed_by: profile?.id, closed_at: new Date().toISOString(),
      informed_balance: informed, difference_amount: informed - Number(cash.expected_balance),
    }).eq('id', cash.id);
    if (error) toast.error(error.message);
    else { toast.success('Caixa fechado'); void load(); }
  }

  if (loading) return <Loading />;
  return <div>
    <div className="mb-6"><h1 className="page-title">PDV e Caixa</h1><p className="mt-1 text-sm text-slate-500">Abra o caixa diariamente e registre todas as entradas e saídas.</p></div>
    {!cash ? <div className="card flex min-h-72 flex-col items-center justify-center p-6 text-center">
      <div className="rounded-2xl bg-violet-50 p-4 text-violet-600"><Wallet size={32}/></div>
      <h2 className="mt-4 text-xl font-bold">Caixa de hoje fechado</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">É preciso abrir o caixa antes de finalizar atendimentos ou lançar saídas.</p>
      <button className="btn-primary" onClick={() => setOpening(true)}><Plus size={18}/>Abrir caixa do dia</button>
    </div> : <>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-slate-500">Saldo inicial</p><b className="mt-2 block text-2xl">{money.format(cash.initial_balance)}</b></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Saldo esperado</p><b className="mt-2 block text-2xl text-violet-700">{money.format(cash.expected_balance)}</b></div>
        <div className="flex gap-2 sm:flex-col">
          <button className="btn-primary flex-1" onClick={showExpense}><ArrowDown size={18}/>Registrar saída</button>
          <button className="btn-secondary flex-1 text-rose-600" onClick={closeCash}><LockKeyhole size={17}/>Fechar caixa</button>
        </div>
      </section>
      <div className="card mt-5 overflow-hidden">
        <div className="border-b p-4"><h2 className="font-bold">Movimentações do caixa</h2></div>
        {!moves.length ? <Empty/> : <div className="divide-y">{moves.map(m => {
          const positive = ['inflow', 'reinforcement', 'receipt'].includes(m.type);
          return <div key={m.id} className="flex items-center justify-between p-4"><div><p className="font-medium">{m.description}</p><p className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString('pt-BR')}</p></div><b className={positive ? 'text-emerald-600' : 'text-rose-600'}>{positive ? '+' : '-'} {money.format(m.amount)}</b></div>;
        })}</div>}
      </div>
    </>}

    {opening && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 sm:items-center sm:p-4"><form onSubmit={openCash} className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl"><div className="mb-5 flex justify-between"><h2 className="text-xl font-bold">Abrir caixa do dia</h2><button type="button" onClick={() => setOpening(false)}><X/></button></div><label><span className="label">Saldo inicial em dinheiro</span><input autoFocus required min="0" step="0.01" type="number" className="input" value={initialBalance} onChange={e => setInitialBalance(Number(e.target.value))}/></label><button className="btn-primary mt-6 w-full">Confirmar abertura</button></form></div>}

    {expenseOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 sm:items-center sm:p-4"><form onSubmit={saveExpense} className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl"><div className="mb-5 flex justify-between"><div><h2 className="text-xl font-bold">Registrar saída</h2><p className="text-sm text-slate-500">Fornecedor, compra, lanche ou outra despesa.</p></div><button type="button" onClick={() => setExpenseOpen(false)}><X/></button></div><div className="space-y-4"><label><span className="label">Tipo de saída</span><select required className="input" value={expense.category} onChange={e => setExpense({...expense, category:e.target.value})}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><span className="label">Descrição</span><input required className="input" placeholder="Ex.: Lanche da tarde" value={expense.description} onChange={e => setExpense({...expense, description:e.target.value})}/></label><label><span className="label">Forma de pagamento</span><select className="input" value={expense.paymentMethod} onChange={e => setExpense({...expense, paymentMethod:e.target.value})}>{methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label><span className="label">Valor</span><input required min="0.01" step="0.01" type="number" className="input" value={expense.amount} onChange={e => setExpense({...expense, amount:Number(e.target.value)})}/></label></div><button className="btn-primary mt-6 w-full">Salvar saída</button></form></div>}
  </div>;
}


