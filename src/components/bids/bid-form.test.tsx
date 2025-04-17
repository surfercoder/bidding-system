import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BidForm } from './bid-form';
import { useAuth } from '@/app/providers';
import { toast } from 'sonner';

// Mock the dependencies
jest.mock('@/app/providers', () => ({
  useAuth: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('BidForm', () => {
  const mockOnSuccess = jest.fn();
  const defaultProps = {
    collectionId: 'collection123',
    userId: 'user123',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user123' } });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('renders the form correctly', () => {
    render(<BidForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/your bid/i)).toBeInTheDocument();
    expect(screen.getByText(/place bid/i)).toBeInTheDocument();
  });

  it('renders update bid button when bid is provided', () => {
    render(
      <BidForm 
        {...defaultProps} 
        bid={{ id: 'bid123', price: 100 }} 
      />
    );
    
    expect(screen.getByText(/update bid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your bid/i)).toHaveValue(100);
  });

  it('validates that price is positive', async () => {
    const user = userEvent.setup();
    render(<BidForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.clear(input);
    await user.type(input, '-10');

    const submitButton = screen.getByText(/place bid/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Use a function matcher to match the error message flexibly
      expect(
        screen.queryByText((content) => /price must be positive/i.test(content))
      ).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits a new bid successfully', async () => {
    const user = userEvent.setup();
    render(<BidForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.type(input, '200');
    
    const submitButton = screen.getByText(/place bid/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: 200,
          userId: 'user123',
          collectionId: 'collection123',
        }),
      });
    });
    
    expect(toast).toHaveBeenCalledWith('Success', {
      description: 'Bid placed successfully',
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('updates an existing bid successfully', async () => {
    const user = userEvent.setup();
    render(
      <BidForm 
        {...defaultProps} 
        bid={{ id: 'bid123', price: 100 }} 
      />
    );
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.type(input, '250');
    
    const submitButton = screen.getByText(/update bid/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bids/bid123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: 250,
          userId: 'user123',
          collectionId: 'collection123',
        }),
      });
    });
    
    expect(toast).toHaveBeenCalledWith('Success', {
      description: 'Bid updated successfully',
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('handles API error response', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Bid amount too low' }),
    });

    render(<BidForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.type(input, '50');
    
    const submitButton = screen.getByText(/place bid/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'Bid amount too low',
      });
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles unexpected errors during submission', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<BidForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.type(input, '150');
    
    const submitButton = screen.getByText(/place bid/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'An unexpected error occurred',
      });
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('prevents submission when user is not logged in', async () => {
    const user = userEvent.setup();
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<BidForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.type(input, '200');
    
    const submitButton = screen.getByText(/place bid/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'You must be logged in to place a bid',
      });
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('disables the submit button during form submission', async () => {
    const user = userEvent.setup();
    
    // Create a delayed promise to test loading state
    let resolvePromise: (value: any) => void;
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<BidForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/your bid/i);
    await user.clear(input);
    await user.type(input, '300');
    
    const submitButton = screen.getByText(/place bid/i);
    
    // Submit the form
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check if button is disabled while loading
    expect(submitButton).toHaveAttribute('disabled');
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Resolve the fetch promise
    await act(async () => {
      resolvePromise({ ok: true, json: async () => ({}) });
    });
    
    await waitFor(() => {
      expect(submitButton).not.toHaveAttribute('disabled');
      expect(screen.getByText('Place Bid')).toBeInTheDocument();
    });
  });
});