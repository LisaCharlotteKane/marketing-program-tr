import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, WarningCircle, ArrowsClockwise } from "@phosphor-icons/react";

export function StorageTest() {
  // Test localStorage with a simple key-value pair
  const [testValue, setTestValue] = useState({ message: "Initial test value", timestamp: Date.now() });
  const [inputValue, setInputValue] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("storageTest");
      if (stored) {
        setTestValue(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading test value:', error);
    }
  }, [refreshCounter]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Update the stored value
  const updateTestValue = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a test message");
      return;
    }

    const newValue = {
      message: inputValue.trim(),
      timestamp: Date.now()
    };

    try {
      localStorage.setItem("storageTest", JSON.stringify(newValue));
      setTestValue(newValue);
      toast.success("Test value updated in localStorage");
      setInputValue("");
    } catch (error) {
      toast.error("Error updating test value");
      console.error('Error updating test value:', error);
    }
  };

  // Force a refresh to see if we get the latest value
  const forceRefresh = () => {
    setRefreshCounter(prev => prev + 1);
    toast.info("Refreshing localStorage value");
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" /> Shared Storage Test
        </CardTitle>
        <CardDescription>
          Verify that localStorage is working correctly
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-md bg-muted p-4">
          <h4 className="font-medium mb-2">Current Storage Value:</h4>
          <div className="bg-card rounded-md p-3 font-mono text-sm">
            <div>Message: <span className="text-primary">{testValue?.message || "No value found"}</span></div>
            <div className="text-xs text-muted-foreground mt-1">
              Last updated: {testValue?.timestamp ? formatTimestamp(testValue.timestamp) : "Never"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-message">Test Message</Label>
            <div className="flex gap-2">
              <Input
                id="test-message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a test message to store"
              />
              <Button onClick={updateTestValue}>Update</Button>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={forceRefresh}
            className="flex items-center gap-2 w-full justify-center"
          >
            <ArrowsClockwise className="h-4 w-4" /> Refresh from Storage
          </Button>
        </div>

        <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <p className="flex items-center gap-2">
            <WarningCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              This storage test now uses localStorage instead of Spark shared storage to avoid authentication issues.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}