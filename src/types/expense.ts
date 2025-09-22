export interface Expense {
  id?: string;
  amount: number;
  description: string;
  descriptionLowerCase: string;
  category: string;
  currency: string;
  date: Date | null;
  userId: string | undefined;
}
