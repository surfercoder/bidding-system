import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BidsList } from './bids-list';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

// Mock fetch
global.fetch = jest.fn();

const mockBids = [
  {
    id: '1',
    price: 100,
    status: 'PENDING',
    userId: 'user1',
    collectionId: 'collection1',
    user: {
      id: 'user1',
      name: 'John Doe',
    },
  },
  {
    id: '2',
    price: 200,
    status: 'ACCEPTED',
    userId: 'user2',
    collectionId: 'collection1',
    user: {
      id: 'user2',
      name: 'Jane Smith',
    },
  },
];

const mockProps = {
  bids: mockBids,
  isOwner: false,
  onAccept: jest.fn(),
  onUpdate: jest.fn(),
  currentUserId: 'user1',
};

describe('BidsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no bids', () => {
    render(<BidsList {...mockProps} bids={[]} />);
    expect(screen.getByText('No bids yet')).toBeInTheDocument();
  });

  it('renders all bids with correct information', () => {
    render(<BidsList {...mockProps} />);
    
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
    expect(screen.getByText('by Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
  });

  it('shows accept button for pending bids when user is owner', () => {
    render(<BidsList {...mockProps} isOwner={true} />);
    const acceptButton = screen.getByRole('button', { name: 'Accept bid' });
    expect(acceptButton).toBeInTheDocument();
  });

  it('shows edit and delete buttons for user\'s own pending bids', () => {
    render(<BidsList {...mockProps} />);
    const editButton = screen.getByRole('button', { name: 'Edit bid' });
    const deleteButton = screen.getByRole('button', { name: 'Delete bid' });
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles bid deletion with confirmation', async () => {
    mockConfirm.mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<BidsList {...mockProps} />);
    const deleteButton = screen.getByRole('button', { name: 'Delete bid' });
    
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to cancel this bid?');
    expect(global.fetch).toHaveBeenCalledWith('/api/bids/1', { method: 'DELETE' });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Bid cancelled', {
        description: 'Your bid has been successfully cancelled.',
      });
    });

    expect(mockProps.onUpdate).toHaveBeenCalled();
  });

  it('handles bid deletion cancellation', () => {
    mockConfirm.mockReturnValue(false);
    
    render(<BidsList {...mockProps} />);
    const deleteButton = screen.getByRole('button', { name: 'Delete bid' });
    
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles bid deletion error', async () => {
    mockConfirm.mockReturnValue(true);
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<BidsList {...mockProps} />);
    const deleteButton = screen.getByRole('button', { name: 'Delete bid' });
    
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'An unexpected error occurred.',
      });
    });
  });

  it('handles bid acceptance', () => {
    render(<BidsList {...mockProps} isOwner={true} />);
    const acceptButton = screen.getByRole('button', { name: 'Accept bid' });
    
    fireEvent.click(acceptButton);
    
    expect(mockProps.onAccept).toHaveBeenCalledWith('1');
  });
});