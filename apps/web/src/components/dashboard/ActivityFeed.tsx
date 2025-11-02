import { MessageSquare, Calculator, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from '@/lib/date-utils';

interface Activity {
  id: string;
  type: 'chat' | 'feed';
  title: string;
  timestamp: Date;
  description?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

export function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Start using the app to see activity here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                {activity.type === 'chat' ? (
                  <MessageSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Calculator className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

