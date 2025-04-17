'use client';

import { useState } from 'react';
import { Collection, Bid } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers';
import { BidsList } from '@/components/bids/bids-list';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CollectionForm } from '@/components/collections/collection-form';
import { BidForm } from '@/components/bids/bid-form';

interface CollectionWithRelations extends Collection {
  user: {
    id: string;
    name: string;
  };
  bids: (Bid & {
    user: {
      id: string;
      name: string;
    };
  })[];
}

interface CollectionCardProps {
  collection: CollectionWithRelations;
  onUpdate: () => void;
}

export function CollectionCard({ collection, onUpdate }: CollectionCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const { user } = useAuth();

  const isOwner = user?.id === collection.userId;
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast('Collection deleted', {
          description: 'The collection has been successfully deleted.',
        });
        onUpdate();
      } else {
        toast('Error', {
          description: 'Failed to delete the collection.',
        });
      }
    } catch {
      toast('Error', {
        description: 'An unexpected error occurred.',
      });
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      const response = await fetch(`/api/bids/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bidId,
          collectionId: collection.id,
        }),
      });
      
      if (response.ok) {
        toast('Bid accepted', {
          description: 'The bid has been successfully accepted and other bids have been rejected.',
        });
        onUpdate();
      } else {
        toast('Error', {
          description: 'Failed to accept the bid.',
        });
      }
    } catch {
      toast('Error', {
        description: 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="w-full border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">{collection.name}</div>
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                  </DialogHeader>
                  <CollectionForm 
                    collection={collection} 
                    onSuccess={() => {
                      setIsEditDialogOpen(false);
                      onUpdate();
                    }} 
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleDelete}>Delete</Button>
            </>
          ) : (
            <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Place Bid</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Place Bid for {collection.name}</DialogTitle>
                </DialogHeader>
                <BidForm 
                  collectionId={collection.id} 
                  userId={user?.id || ''} 
                  onSuccess={() => {
                    setIsBidDialogOpen(false);
                    onUpdate();
                  }} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="mt-4">
        <BidsList
          bids={collection.bids}
          isOwner={isOwner}
          onAccept={handleAcceptBid}
          onUpdate={onUpdate}
          currentUserId={user?.id || ''}
        />
      </div>
    </div>
  );
}