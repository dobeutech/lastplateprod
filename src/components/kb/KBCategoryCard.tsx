import { 
  Rocket, Trash2, Users, Package, BarChart3, 
  Plug, Bell, Leaf, CreditCard, AlertCircle, 
  Award, Shield 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { KBCategory } from '@/lib/kb-types';

const iconMap = {
  Rocket, Trash2, Users, Package, BarChart3,
  Plug, Bell, Leaf, CreditCard, AlertCircle,
  Award, Shield
};

interface KBCategoryCardProps {
  category: KBCategory;
  onClick: () => void;
}

export function KBCategoryCard({ category, onClick }: KBCategoryCardProps) {
  const Icon = iconMap[category.icon as keyof typeof iconMap];

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
            {category.articleCount !== undefined && (
              <p className="text-sm text-muted-foreground mt-2">
                {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
