import * as Icons from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  color?: string;
}

export function CategoryIcon({ iconName, className, color }: CategoryIconProps) {
  // 1. Convert kebab-case from DB (e.g., 'shopping-bag') to PascalCase (e.g., 'ShoppingBag')
  const pascalCaseName = iconName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 2. Resolve the component from the Lucide library
  // Fallback to 'HelpCircle' or 'Circle' if the icon name doesn't exist
  const IconComponent = (Icons as any)[pascalCaseName] || Icons.Circle;

  return <IconComponent className={className} style={{ color: color }} />;
}