export interface SavingGoal {
  id: string;

  user_id: string;

  title: string;

  target_amount: number;

  current_amount: number;

  allocated_amount: number;

  target_date: string | null;

  is_completed: boolean;

  created_at: string;
}