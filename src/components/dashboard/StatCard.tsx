
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  change: string;
  icon: React.ReactNode;
  href: string;
  index?: number;
}

const StatCard = ({ title, value, description, change, icon, href, index = 0 }: StatCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className={cn(
        "border overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer",
        "hover:border-primary/20 group animate-slide-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => navigate(href)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium transition-colors group-hover:text-primary">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <p className="text-xs font-medium text-primary mt-4">{change}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
