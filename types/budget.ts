export type BudgetPeriod =
  | "daily"
  | "weekly"
  | "monthly";


export interface Budget {
  id: string;

  user_id: string;

  category_id: string;

  amount: number;

  period: BudgetPeriod;

  start_date: string;
  end_date: string;
}