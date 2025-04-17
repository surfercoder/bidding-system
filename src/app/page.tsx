'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollectionsList } from '@/components/collections/collections-list';
import User from '@/types/user';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, login, logout } = useAuth();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleLogin = (userId: string) => {
    login(userId);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Bidding System</h1>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {user.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Card className="w-64">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mock Login</CardTitle>
                <CardDescription className="text-xs">Select a user to login</CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleLogin} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>
      </header>
      
      <CollectionsList />
    </main>
  );
}