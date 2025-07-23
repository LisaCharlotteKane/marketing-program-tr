import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import { SimpleCampaignTable } from '@/components/simple-campaign-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Application Error</CardTitle>
              <CardDescription>
                An error occurred while loading the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md"
              >
                Reload Application
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback localStorage hook if GitHub Spark is not available
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Simple storage hook using localStorage to avoid authentication issues
function useCampaignStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  return useLocalStorage(key, initialValue);
}

function AppContent() {
  const [campaigns, setCampaigns] = useCampaignStorage('campaignData', []);
  const [activeTab, setActiveTab] = useState('planning');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />
      
      <header className="border-b shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Marketing Campaign Planner</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Storage: {Array.isArray(campaigns) ? campaigns.length : 0} campaigns
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="planning">Campaign Planning</TabsTrigger>
            <TabsTrigger value="execution">Execution Tracking</TabsTrigger>
            <TabsTrigger value="budget">Budget Management</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <SimpleCampaignTable campaigns={campaigns} setCampaigns={setCampaigns} />
          </TabsContent>

          <TabsContent value="execution">
            <Card>
              <CardHeader>
                <CardTitle>Execution Tracking</CardTitle>
                <CardDescription>
                  Track campaign execution status and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>
                  Monitor and manage regional marketing budgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reporting">  
            <Card>
              <CardHeader>
                <CardTitle>Reporting Dashboard</CardTitle>
                <CardDescription>
                  View performance metrics and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View campaigns in a calendar layout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}