import { createClient } from "@/lib/supabase/client";
import { Category } from "../../types/category";

const TABLE = "categories";

// GET ALL CATEGORIES
export async function getCategories(userId: string | null | undefined): Promise<Category[]> {
  if (!userId) {
    return [];
  }
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories failed", error);
    throw error;
  }

  return data as Category[];
}

// GET CATEGORY BY ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getCategoryById failed", error);
    throw error;
  }

  return data as Category;
}

// CREATE CATEGORY
interface CreateCategoryInput {
  user_id?: string | null;

  name: string;

  icon?: string | null;
  color?: string | null;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: input.user_id ?? null,
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("createCategory failed", error);
    throw error;
  }

  return data as Category;
}

// UPDATE CATEGORY
interface UpdateCategoryInput {
  name?: string;

  icon?: string | null;
  color?: string | null;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...(input.name !== undefined && {
        name: input.name,
      }),

      ...(input.icon !== undefined && {
        icon: input.icon,
      }),

      ...(input.color !== undefined && {
        color: input.color,
      }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateCategory failed", error);
    throw error;
  }

  return data as Category;
}

// DELETE CATEGORY
export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("deleteCategory failed", error);
    throw error;
  }
}
