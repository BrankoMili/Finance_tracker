import { Currency } from "./currency";

export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: "food" | "housing" | "transport" | "other";
  currency: Currency;
  date: Date;
  userId: string | undefined;
}
