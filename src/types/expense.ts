export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: "food" | "housing" | "transport" | "salary" | "other";
  currency: "RSD" | "EUR" | "USD";
  date: Date;
  userId: string | undefined;
}
