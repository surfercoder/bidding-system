'use client';

import { useState } from 'react';
import { Bid } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BidForm } from '@/components/bids/bid-form';
import { toast } from 'sonner';
import { Edit, Check, X } from 'lucide-react';

interface BidsListProps {
  bids: (Bid & {
    user: {
      id: string;
      name: string;
    };
  })[];
  isOwner: boolean;
  onAccept: (bidId: string) => void;
  onUpdate: () => void;
  currentUserId: string;
}

export function BidsList({ bids, isOwner, onAccept, onUpdate, currentUserId }: BidsListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  const handleDelete = async (bidId: string) => {
    if (!confirm('Are you sure you want to cancel this bid?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast('Bid cancelled', {
          description: 'Your bid has been successfully cancelled.',
        });
        onUpdate();
      } else {
        toast('Error', {
          description: 'Failed to cancel the bid.',
        });
      }
    } catch {
      toast('Error', {
        description: 'An unexpected error occurred.',
      });
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (bids.length === 0) {
    return <p className="py-4 text-center text-gray-500">No bids yet</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      {bids.map((bid) => (
        <div key={bid.id} className="p-3 border rounded-lg flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">${bid.price.toFixed(2)}</span>
              <Badge className={getBadgeVariant(bid.status)}>
                {bid.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">by {bid.user.name}</p>
          </div>
          
          <div className="flex gap-2">
            {isOwner && bid.status === 'PENDING' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onAccept(bid.id)}
                aria-label="Accept bid"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}

            {bid.userId === currentUserId && bid.status === 'PENDING' && (
              <>
                <Dialog 
                  open={isEditDialogOpen && selectedBid?.id === bid.id} 
                  onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setSelectedBid(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedBid(bid)}
                      aria-label="Edit bid"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Bid</DialogTitle>
                    </DialogHeader>
                    {selectedBid && (
                      <BidForm 
                        bid={{
                          id: selectedBid.id,
                          price: selectedBid.price,
                        }}
                        collectionId={selectedBid.collectionId}
                        userId={currentUserId}
                        onSuccess={() => {
                          setIsEditDialogOpen(false);
                          setSelectedBid(null);
                          onUpdate();
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(bid.id)}
                  aria-label="Delete bid"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}