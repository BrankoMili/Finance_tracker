export interface Filters {
  category: string;
  minAmount: number;
  maxAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  currency: string;
}
