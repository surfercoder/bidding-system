'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Collection } from '@prisma/client';
import { useAuth } from '@/app/providers';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  stock: z.number().min(1, { message: 'Stock must be at least 1' }),
  price: z.number().positive({ message: 'Price must be positive' }),
});

interface CollectionFormProps {
  collection?: Collection;
  onSuccess: () => void;
}

export function CollectionForm({ collection, onSuccess }: CollectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection?.name || '',
      description: collection?.description || '',
      stock: collection?.stock || 1,
      price: collection?.price || 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast('Error', {
        description: 'You must be logged in to perform this action',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const url = collection 
        ? `/api/collections/${collection.id}` 
        : '/api/collections';
      
      const method = collection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          userId: user.id,
        }),
      });
      
      if (response.ok) {
        toast('Success', {
          description: collection 
            ? 'Collection updated successfully' 
            : 'Collection created successfully',
        });
        onSuccess();
      } else {
        const data = await response.json();
        toast('Error', {
          description: data.error || 'Something went wrong',
        });
      }
    } catch {
      toast('Error', {
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Collection name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Collection description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Stock quantity" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Price" 
                    step="0.01" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processing...' : collection ? 'Update Collection' : 'Create Collection'}
        </Button>
      </form>
    </Form>
  );
}