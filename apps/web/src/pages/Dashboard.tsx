import { useEffect, useState } from 'react';
import { MessageSquare, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent } from '@/components/ui/card';
import type { AppRoute } from '@/components/layout/AppLayout';

interface DashboardProps {
  onNavigate: (route: AppRoute) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalOptimizations: 0,
    avgFeedCost: 0,
    savedCost: 0,
  });

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Load stats from localStorage
    const chats = JSON.parse(localStorage.getItem('istock_chats') || '[]');
    const feeds = JSON.parse(localStorage.getItem('istock_feeds') || '[]');

    setStats({
      totalChats: chats.length,
      totalOptimizations: feeds.length,
      avgFeedCost: feeds.length > 0
        ? feeds.reduce((sum: number, f: any) => sum + (f.cost || 0), 0) / feeds.length
        : 0,
      savedCost: feeds.length * 15, // Mock savings calculation
    });

    // Create activity feed
    const allActivities = [
      ...chats.slice(-5).map((chat: any) => ({
        id: `chat-${chat.id || Date.now()}`,
        type: 'chat' as const,
        title: chat.query || 'Health query',
        timestamp: new Date(chat.timestamp || Date.now()),
        description: 'Chat conversation',
      })),
      ...feeds.slice(-5).map((feed: any) => ({
        id: `feed-${feed.id || Date.now()}`,
        type: 'feed' as const,
        title: `Feed optimization for ${feed.targetAnimal || 'Animal'}`,
        timestamp: new Date(feed.timestamp || Date.now()),
        description: `Cost: $${feed.cost?.toFixed(2) || '0.00'}`,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

    setActivities(allActivities);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
      <div className="p-6 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Overview of your livestock management
          </p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Chats"
            value={stats.totalChats}
            icon={MessageSquare}
            description="Health queries asked"
            trend={{ value: 12, isPositive: true }}
            gradient="from-blue-500/10 to-blue-500/5"
          />
          <StatsCard
            title="Optimizations"
            value={stats.totalOptimizations}
            icon={Calculator}
            description="Feed calculations"
            trend={{ value: 8, isPositive: true }}
            gradient="from-green-500/10 to-green-500/5"
          />
          <StatsCard
            title="Avg Feed Cost"
            value={`$${stats.avgFeedCost.toFixed(2)}`}
            icon={DollarSign}
            description="Per unit cost"
            trend={{ value: 5, isPositive: false }}
            gradient="from-purple-500/10 to-purple-500/5"
          />
          <StatsCard
            title="Cost Saved"
            value={`$${stats.savedCost.toFixed(2)}`}
            icon={TrendingUp}
            description="Estimated savings"
            trend={{ value: 15, isPositive: true }}
            gradient="from-orange-500/10 to-orange-500/5"
          />
        </div>

        {/* Quick Actions and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions onActionClick={onNavigate} />
          <ActivityFeed
            activities={activities}
            onActivityClick={(activity) => {
              if (activity.type === 'chat') {
                onNavigate('chatbot');
              } else {
                onNavigate('feed-optimizer');
              }
            }}
          />
        </div>

        {/* Welcome Message */}
        {stats.totalChats === 0 && stats.totalOptimizations === 0 && (
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground">
                  Welcome to iStock!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Get started by asking a health question or optimizing your feed costs. 
                  Your activity will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

