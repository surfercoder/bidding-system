import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollectionsList } from './collections-list';
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

const mockCollections = [
  {
    id: '1',
    name: 'Test Collection 1',
    description: 'Test Description 1',
    price: 100,
    stock: 10,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user1',
      name: 'Test User 1',
    },
    bids: [],
    _count: {
      bids: 0,
    },
  },
  {
    id: '2',
    name: 'Test Collection 2',
    description: 'Test Description 2',
    price: 200,
    stock: 20,
    userId: 'user2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user2',
      name: 'Test User 2',
    },
    bids: [],
    _count: {
      bids: 0,
    },
  },
];

describe('CollectionsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
  });

  it('renders loading state initially', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<CollectionsList />);
    expect(screen.getByText('Loading collections...')).toBeInTheDocument();
  });

  it('renders collections after loading', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collections: mockCollections }),
    });

    render(<CollectionsList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading collections...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Collection 1')).toBeInTheDocument();
    expect(screen.getByText('Test Collection 2')).toBeInTheDocument();
  });

  it('shows error toast when fetch fails', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<CollectionsList />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'An unexpected error occurred while fetching collections',
      });
    });
  });

  it('filters collections based on search term', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collections: mockCollections }),
    });

    render(<CollectionsList />);

    await waitFor(() => {
      expect(screen.queryByText('Loading collections...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search collections...');
    fireEvent.change(searchInput, { target: { value: 'Test Collection 1' } });

    expect(screen.getByText('Test Collection 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Collection 2')).not.toBeInTheDocument();
  });

  it('shows Add Collection button when user is logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user1', name: 'Test User' },
    });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collections: [] }),
    });

    render(<CollectionsList />);
    expect(screen.getByText('Add Collection')).toBeInTheDocument();
  });

  it('hides Add Collection button when user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collections: [] }),
    });

    render(<CollectionsList />);
    expect(screen.queryByText('Add Collection')).not.toBeInTheDocument();
  });

  it('shows "No collections found" when there are no collections', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collections: [] }),
    });

    render(<CollectionsList />);

    await waitFor(() => {
      expect(screen.getByText('No collections found')).toBeInTheDocument();
    });
  });
});