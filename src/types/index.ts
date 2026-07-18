export type Role='admin'|'manager'|'employee'|'professional';
export type TransactionType='income'|'expense';
export type TransactionStatus='received'|'pending'|'partial'|'cancelled'|'paid'|'overdue';
export interface Profile {id:string;full_name:string;email:string;phone?:string;role:Role;active:boolean}
export interface FinancialTransaction {id:string;description:string;transaction_type:TransactionType;origin_type:string;gross_amount:number;discount_amount:number;additional_amount:number;net_amount:number;due_date?:string;competence_date:string;payment_date?:string;status:TransactionStatus;notes?:string;created_at:string;professional?:{name:string}|null;category?:{name:string}|null}
export interface DashboardData {dayIncome:number;monthIncome:number;dayExpense:number;monthExpense:number;profit:number;receivable:number;payable:number;cashBalance:number;pendingCommissions:number;movementCount:number;chart:{label:string;receitas:number;despesas:number}[]}
export interface SelectOption {id:string;name:string}




