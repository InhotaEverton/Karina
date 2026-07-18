export const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
export const shortDate=(value?:string)=>value?new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`)):'—';
export const today=()=>new Date().toISOString().slice(0,10);
export const monthStart=()=>`${today().slice(0,7)}-01`;
export const statusLabel:Record<string,string>={received:'Recebido',paid:'Pago',pending:'Pendente',partial:'Parcial',cancelled:'Cancelado',overdue:'Vencido'};



