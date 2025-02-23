import { Currency } from "./currency";

export interface Subscription {
  id?: string;
  amount: number;
  description: string;
  currency: Currency;
  date: Date;
  userId: string | undefined;
}
