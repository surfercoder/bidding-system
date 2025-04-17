import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollectionCard } from './collection-card';
import { useAuth } from '@/app/providers';
import { toast } from 'sonner';

// Mock the dependencies
jest.mock('@/app/providers', () => ({
  useAuth: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();
global.confirm = jest.fn();

const mockCollection = {
  id: '1',
  name: 'Test Collection',
  description: 'Test Description',
  price: 100,
  stock: 10,
  userId: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id: 'user1',
    name: 'Test User',
  },
  bids: [
    {
      id: 'bid1',
      price: 90,
      status: 'PENDING',
      userId: 'user2',
      collectionId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user2',
        name: 'Bidder User',
      },
    },
  ],
};

const mockOnUpdate = jest.fn();

describe('CollectionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    (global.confirm as jest.Mock).mockReset();
  });

  it('renders collection details correctly', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user2' } });

    render(<CollectionCard collection={mockCollection} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('by Bidder User')).toBeInTheDocument();
    expect(screen.getByText('$90.00')).toBeInTheDocument();
  });

  it('shows owner actions when user is the owner', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' } });

    render(<CollectionCard collection={mockCollection} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows place bid button when user is not the owner', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user2' } });

    render(<CollectionCard collection={mockCollection} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Place Bid')).toBeInTheDocument();
  });

  it('handles collection deletion', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' } });
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<CollectionCard collection={mockCollection} onUpdate={mockOnUpdate} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/collections/${mockCollection.id}`,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(toast).toHaveBeenCalledWith('Collection deleted', expect.any(Object));
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles bid acceptance', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' } });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<CollectionCard collection={mockCollection} onUpdate={mockOnUpdate} />);

    const acceptButton = screen.getByLabelText('Accept bid');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bids/accept',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            bidId: 'bid1',
            collectionId: '1',
          }),
        })
      );
      expect(toast).toHaveBeenCalledWith('Bid accepted', expect.any(Object));
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles error during collection deletion', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user1' } });
    (global.confirm as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CollectionCard collection={mockCollection} onUpdate={mockOnUpdate} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'An unexpected error occurred.',
      });
    });
  });
});