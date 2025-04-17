import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionForm } from './collection-form';
import { useAuth } from '@/app/providers';
import { toast } from 'sonner';

// Mock the dependencies
jest.mock('@/app/providers', () => ({
  useAuth: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

const mockUser = {
  id: 'user-1',
  name: 'Test User',
};

const mockCollection = {
  id: 'collection-1',
  name: 'Test Collection',
  description: 'Test Description that is long enough',
  stock: 5,
  price: 100,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOnSuccess = jest.fn();

describe('CollectionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    global.fetch = jest.fn();
  });

  it('renders the form with empty fields for creation', () => {
    render(<CollectionForm onSuccess={mockOnSuccess} />);

    expect(screen.getByPlaceholderText('Collection name')).toHaveValue('');
    expect(screen.getByPlaceholderText('Collection description')).toHaveValue('');
    expect(screen.getByPlaceholderText('Stock quantity')).toHaveValue(1);
    expect(screen.getByPlaceholderText('Price')).toHaveValue(0);
    expect(screen.getByRole('button')).toHaveTextContent('Create Collection');
  });

  it('renders the form with existing collection data for editing', () => {
    render(<CollectionForm collection={mockCollection} onSuccess={mockOnSuccess} />);

    expect(screen.getByPlaceholderText('Collection name')).toHaveValue(mockCollection.name);
    expect(screen.getByPlaceholderText('Collection description')).toHaveValue(mockCollection.description);
    expect(screen.getByPlaceholderText('Stock quantity')).toHaveValue(mockCollection.stock);
    expect(screen.getByPlaceholderText('Price')).toHaveValue(mockCollection.price);
    expect(screen.getByRole('button')).toHaveTextContent('Update Collection');
  });

  it('shows validation errors for invalid inputs', async () => {
    render(<CollectionForm onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('handles successful collection creation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<CollectionForm onSuccess={mockOnSuccess} />);

    await userEvent.type(screen.getByPlaceholderText('Collection name'), 'New Collection');
    await userEvent.type(screen.getByPlaceholderText('Collection description'), 'This is a new test collection description');
    await userEvent.type(screen.getByPlaceholderText('Stock quantity'), '10');
    await userEvent.type(screen.getByPlaceholderText('Price'), '50');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Collection',
          description: 'This is a new test collection description',
          stock: 10,
          price: 50,
          userId: mockUser.id,
        }),
      });
      expect(toast).toHaveBeenCalledWith('Success', {
        description: 'Collection created successfully',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles successful collection update', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<CollectionForm collection={mockCollection} onSuccess={mockOnSuccess} />);

    await userEvent.clear(screen.getByPlaceholderText('Collection name'));
    await userEvent.type(screen.getByPlaceholderText('Collection name'), 'Updated Collection');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/collections/${mockCollection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
      expect(toast).toHaveBeenCalledWith('Success', {
        description: 'Collection updated successfully',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles API error response', async () => {
    const errorMessage = 'API Error';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<CollectionForm onSuccess={mockOnSuccess} />);

    await userEvent.type(screen.getByPlaceholderText('Collection name'), 'New Collection');
    await userEvent.type(screen.getByPlaceholderText('Collection description'), 'This is a new test collection description');
    await userEvent.type(screen.getByPlaceholderText('Stock quantity'), '10');
    await userEvent.type(screen.getByPlaceholderText('Price'), '50');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: errorMessage,
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CollectionForm onSuccess={mockOnSuccess} />);

    await userEvent.type(screen.getByPlaceholderText('Collection name'), 'New Collection');
    await userEvent.type(screen.getByPlaceholderText('Collection description'), 'This is a new test collection description');
    await userEvent.type(screen.getByPlaceholderText('Stock quantity'), '10');
    await userEvent.type(screen.getByPlaceholderText('Price'), '50');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'An unexpected error occurred',
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('prevents submission when user is not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<CollectionForm onSuccess={mockOnSuccess} />);

    await userEvent.type(screen.getByPlaceholderText('Collection name'), 'New Collection');
    await userEvent.type(screen.getByPlaceholderText('Collection description'), 'This is a new test collection description');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Error', {
        description: 'You must be logged in to perform this action',
      });
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});