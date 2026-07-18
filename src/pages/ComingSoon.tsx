import{BarChart3,Settings2}from'lucide-react';export function ComingSoon({title}:{title:string}){return <div><h1 className="page-title">{title}</h1><p className="mt-1 text-sm text-slate-500">Visão integrada aos seus dados financeiros.</p><div className="card mt-6 flex min-h-80 flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-violet-50 p-4 text-violet-600">{title==='Relatórios'?<BarChart3 size={34}/>:<Settings2 size={34}/>}</div><h2 className="mt-4 text-xl font-bold">Módulo preparado</h2><p className="mt-2 max-w-md text-sm text-slate-500">A estrutura de dados e permissões deste módulo já está disponível no Supabase. Complete a configuração do projeto para começar.</p></div></div>}



