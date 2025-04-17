'use client';

import { useState, useEffect } from 'react';
import { Collection, Bid } from '@prisma/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CollectionCard } from '@/components/collections/collection-card';
import { CollectionForm } from '@/components/collections/collection-form';
import { useAuth } from '@/app/providers';
import { Plus, Search } from 'lucide-react';

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
  _count: {
    bids: number;
  };
}

export function CollectionsList() {
  const [collections, setCollections] = useState<CollectionWithRelations[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<CollectionWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      
      if (response.ok) {
        setCollections(data.collections);
        setFilteredCollections(data.collections);
      } else {
        toast('Error', {
          description: data.error || 'Failed to fetch collections',
        });
      }
    } catch {
      toast('Error', {
        description: 'An unexpected error occurred while fetching collections',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = collections.filter(
        collection =>
          collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          collection.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCollections(filtered);
    } else {
      setFilteredCollections(collections);
    }
  }, [searchTerm, collections]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <CollectionForm 
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchCollections();
                }} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="mb-6 relative">
        <Input
          placeholder="Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading collections...</div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-8">No collections found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <CollectionCard 
              key={collection.id} 
              collection={collection}
              onUpdate={fetchCollections}
            />
          ))}
        </div>
      )}
    </div>
  );
}