import { MessageSquare, Calculator, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AppRoute } from '@/components/layout/AppLayout';

interface QuickAction {
  id: AppRoute;
  label: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
}

interface QuickActionsProps {
  onActionClick: (route: AppRoute) => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'chatbot',
    label: 'Health Chatbot',
    icon: MessageSquare,
    description: 'Ask health questions',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'feed-optimizer',
    label: 'Feed Optimizer',
    icon: Calculator,
    description: 'Optimize feed costs',
    gradient: 'from-green-500 to-green-600',
  },
  {
    id: 'health-records',
    label: 'Health Records',
    icon: FileText,
    description: 'View past diagnoses',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    id: 'ingredients',
    label: 'Ingredients',
    icon: BookOpen,
    description: 'Manage ingredients',
    gradient: 'from-orange-500 to-orange-600',
  },
];

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onActionClick(action.id)}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 p-5 hover:border-primary transition-all hover:shadow-lg text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

