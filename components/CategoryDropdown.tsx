import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "./ui/CategoryIcon";
import { useCategories } from "@/app/_components/providers/CategoryProvider";

const AUTO_CATEGORY_VALUE = "__auto__";

type CategoryDropdownProps = {
  category_id: string,
  handleSelectChange: (category_id: string) => void,
  autoGenerate: boolean
};

function CategoryDropdown({
  category_id,
  handleSelectChange,
  autoGenerate
}: CategoryDropdownProps) {
  const { categories: categoryOptions, isLoading } = useCategories();

  return (
    <Select
      value={category_id}
      onValueChange={handleSelectChange}
    >
      <SelectTrigger className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
        <SelectValue
          placeholder={isLoading ? "Loading..." : "Select category"}
        />
      </SelectTrigger>

      <SelectContent className="w-fit">
        {autoGenerate &&
            <SelectItem value={AUTO_CATEGORY_VALUE} className="border-b-2">
              <div className="flex items-center gap-2">
                <CategoryIcon
                  iconName="sparkles"
                  className="w-4 h-4"
                  color="#a855f7"
                />
                <span>Auto Generate Category</span>
              </div>
            </SelectItem>
        }

        {categoryOptions.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <CategoryIcon
                iconName={category.icon!}
                color={category.color!}
                className="w-4 h-4"
              />
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CategoryDropdown;
