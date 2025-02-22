import { Currency } from "./currency";

export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  currency: Currency;
  date: Date;
  userId: string | undefined;
}
