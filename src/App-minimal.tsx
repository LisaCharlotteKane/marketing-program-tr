import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Simple storage hook using localStorage
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

function App() {
  const [campaigns, setCampaigns] = useLocalStorage('campaignData', []);

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
        <Card>
          <CardHeader>
            <CardTitle>Marketing Campaign Planner</CardTitle>
            <CardDescription>
              Plan and track your marketing campaigns across APAC regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Application is loading... If you see this message, the app is working but some components may need to be rebuilt.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Current Storage:</h3>
              <p>{JSON.stringify(campaigns, null, 2)}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default App;