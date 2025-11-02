import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SignIn } from '@/components/auth/SignIn';
import { SignUp } from '@/components/auth/SignUp';
import { AppLayout, type AppRoute } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Chatbot } from '@/pages/Chatbot';
import { FeedOptimizer } from '@/pages/FeedOptimizer';
import { HealthRecords } from '@/pages/HealthRecords';
import { IngredientLibrary } from '@/pages/IngredientLibrary';
import { Settings } from '@/pages/Settings';

type AuthView = 'sign-in' | 'sign-up';

function App() {
  const { isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('sign-in');
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');

  // Not authenticated - show auth screen
  if (!isAuthenticated) {
    if (authView === 'sign-in') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background p-4">
          <SignIn
            onSwitchToSignUp={() => setAuthView('sign-up')}
            onSuccess={() => {}}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background p-4">
        <SignUp
          onSwitchToSignIn={() => setAuthView('sign-in')}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  // Authenticated - show main app with routing
  const renderRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentRoute} />;
      case 'chatbot':
        return <Chatbot />;
      case 'feed-optimizer':
        return <FeedOptimizer />;
      case 'health-records':
        return <HealthRecords />;
      case 'ingredients':
        return <IngredientLibrary />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <AppLayout
      currentRoute={currentRoute}
      onRouteChange={setCurrentRoute}
    >
      {renderRoute()}
    </AppLayout>
  );
}

export default App;
