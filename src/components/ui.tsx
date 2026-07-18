import type { ReactNode } from 'react';
import { AlertCircle,LoaderCircle,Search } from 'lucide-react';
import { money,statusLabel } from '../lib/format';
export function Loading({label='Carregando...'}:{label?:string}){return <div className="flex min-h-48 items-center justify-center gap-2 text-slate-500"><LoaderCircle className="animate-spin" size={20}/>{label}</div>}
export function Empty({title='Nenhum registro encontrado',description='Ajuste os filtros ou adicione um novo registro.'}:{title?:string;description?:string}){return <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center"><div className="mb-3 rounded-full bg-slate-100 p-3"><Search className="text-slate-400"/></div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>}
export function ErrorState({message,retry}:{message:string;retry?:()=>void}){return <div className="card flex min-h-48 flex-col items-center justify-center p-6 text-center"><AlertCircle className="mb-2 text-rose-500"/><p className="font-semibold">Não foi possível carregar</p><p className="my-2 text-sm text-slate-500">{message}</p>{retry&&<button className="btn-secondary" onClick={retry}>Tentar novamente</button>}</div>}
export function Status({value}:{value:string}){const cls=value==='received'||value==='paid'?'bg-emerald-50 text-emerald-700':value==='cancelled'?'bg-slate-100 text-slate-600':value==='overdue'?'bg-rose-50 text-rose-700':'bg-amber-50 text-amber-700';return <span className={`badge ${cls}`}>{statusLabel[value]||value}</span>}
export function Metric({label,value,icon,accent='violet'}:{label:string;value:number;icon:ReactNode;accent?:'violet'|'emerald'|'rose'|'amber'}){const c={violet:'bg-violet-50 text-violet-600',emerald:'bg-emerald-50 text-emerald-600',rose:'bg-rose-50 text-rose-600',amber:'bg-amber-50 text-amber-600'}[accent];return <div className="card p-4 lg:p-5"><div className={`mb-4 inline-flex rounded-xl p-2.5 ${c}`}>{icon}</div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{money.format(value)}</p></div>}



