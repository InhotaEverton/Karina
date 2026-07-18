import { z } from 'zod';
export const transactionSchema=z.object({description:z.string().min(3,'Informe ao menos 3 caracteres'),gross_amount:z.number().positive('O valor deve ser maior que zero'),competence_date:z.string().min(1,'Informe a data'),due_date:z.string().optional(),status:z.string().min(1),notes:z.string().optional()});export type TransactionForm=z.infer<typeof transactionSchema>;




