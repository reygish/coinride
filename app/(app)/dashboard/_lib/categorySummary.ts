import { createClient } from "@/lib/supabase/client";

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total_amount: number;
}

export async function fetchExpenseSummaryByCategory(userId: string): Promise<CategorySummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories!inner (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('user_id', userId)
    .eq('type', 'expense');

  if (error) {
    console.error("Error fetching summaries:", error);
    throw error;
  }

  // Aggregate data structures on the client side 
  // (PostgreSQL does this natively, but Supabase JS syntax makes client aggregation easier here)
  const structuralMap: Record<string, CategorySummary> = {};

  data.forEach((row: any) => {
    const cat = row.categories;
    if (!cat) return;

    if (!structuralMap[cat.id]) {
      structuralMap[cat.id] = {
        category_id: cat.id,
        category_name: cat.name,
        category_color: cat.color || '#6b7280',
        category_icon: cat.icon || 'circle',
        total_amount: 0,
      };
    }
    
    structuralMap[cat.id].total_amount += Number(row.amount);
  });

  // Return sorted categories (highest expenses first)
  return Object.values(structuralMap).sort((a, b) => b.total_amount - a.total_amount);
}