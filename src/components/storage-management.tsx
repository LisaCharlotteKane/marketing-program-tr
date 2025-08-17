import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SharedStorage } from '@/components/shared-storage';

export function StorageManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage Management</CardTitle>
          <CardDescription>
            View and manage different storage scopes in this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global">
            <TabsList className="mb-4">
              <TabsTrigger value="global">Global Storage</TabsTrigger>
              <TabsTrigger value="user">User Storage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="global">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Global storage is shared among all users of the application. Any data saved here 
                  will be visible to everyone using the app.
                </p>
                <SharedStorage scope="global" />
              </div>
            </TabsContent>
            
            <TabsContent value="user">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  User storage is specific to the current user. Data saved here will only
                  be visible to you.
                </p>
                <SharedStorage scope="user" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}