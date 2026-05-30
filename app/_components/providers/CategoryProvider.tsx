"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Category } from "@/types/category";
import { getCategories } from "@/lib/category/queries";
import { useUser } from "@/app/_components/providers/UserProvider";

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories(user?.id);
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user?.id]);

  return (
    <CategoryContext.Provider
      value={{ categories, isLoading, refreshCategories: fetchCategories }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
