'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/app/providers';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formSchema = z.object({
  price: z.number().positive({ message: 'Price must be positive' }),
});

interface BidFormProps {
  bid?: {
    id: string;
    price: number;
  };
  collectionId: string;
  userId: string;
  onSuccess: () => void;
}

export function BidForm({ bid, collectionId, userId, onSuccess }: BidFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: bid?.price || 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast('Error', {
        description: 'You must be logged in to place a bid',
      });
      return;
    }

    setIsLoading(true);

    try {
      const url = bid
        ? `/api/bids/${bid.id}`
        : '/api/bids';

      const method = bid ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: values.price,
          userId,
          collectionId,
        }),
      });

      if (response.ok) {
        toast('Success', {
          description: bid
            ? 'Bid updated successfully'
            : 'Bid placed successfully',
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
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Bid ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your bid amount"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processing...' : bid ? 'Update Bid' : 'Place Bid'}
        </Button>
      </form>
    </Form>
  );
}