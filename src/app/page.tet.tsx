// // page.test.tsx
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { rest } from 'msw';
// import { setupServer } from 'msw/node';
// import Home from './page';
// import { useAuth } from './providers';

// // Mock the providers module
// jest.mock('./providers', () => ({
//   useAuth: jest.fn(),
// }));

// // Mock the collections component
// jest.mock('@/components/collections/collections-list', () => ({
//   CollectionsList: () => <div data-testid="collections-list">Collections List</div>,
// }));

// // Sample test data
// const mockUsers = [
//   { id: '1', name: 'John Doe' },
//   { id: '2', name: 'Jane Smith' },
// ];

// // Setup MSW server to intercept API requests
// const server = setupServer(
//   rest.get('/api/users', (req, res, ctx) => {
//     return res(ctx.json({ users: mockUsers }));
//   })
// );

// describe('Home Page Component', () => {
//   // Mock auth functions
//   const mockLoginFn = jest.fn();
//   const mockLogoutFn = jest.fn();
  
//   beforeAll(() => server.listen());
//   afterEach(() => {
//     server.resetHandlers();
//     jest.clearAllMocks();
//   });
//   afterAll(() => server.close());

//   describe('when user is not logged in', () => {
//     beforeEach(() => {
//       (useAuth as jest.Mock).mockReturnValue({
//         user: null,
//         login: mockLoginFn,
//         logout: mockLogoutFn,
//       });
//     });

//     it('renders the login card when no user is logged in', async () => {
//       render(<Home />);
      
//       expect(screen.getByText('Mock Login')).toBeInTheDocument();
//       expect(screen.getByText('Select a user to login')).toBeInTheDocument();
      
//       // Wait for users to load
//       await waitFor(() => {
//         expect(screen.getByRole('combobox')).not.toBeDisabled();
//       });
//     });

//     it('loads users from API and populates the select dropdown', async () => {
//       render(<Home />);
      
//       // Open the dropdown
//       const selectButton = await waitFor(() => screen.getByRole('combobox'));
//       fireEvent.click(selectButton);
      
//       // Check if users are listed
//       await waitFor(() => {
//         expect(screen.getByText('John Doe')).toBeInTheDocument();
//         expect(screen.getByText('Jane Smith')).toBeInTheDocument();
//       });
//     });

//     it('calls login function when a user is selected', async () => {
//       const user = userEvent.setup();
//       render(<Home />);
      
//       // Wait for select to be enabled
//       await waitFor(() => {
//         expect(screen.getByRole('combobox')).not.toBeDisabled();
//       });
      
//       // Open dropdown and select a user
//       await user.click(screen.getByRole('combobox'));
//       await waitFor(() => {
//         expect(screen.getByText('John Doe')).toBeInTheDocument();
//       });
//       await user.click(screen.getByText('John Doe'));
      
//       // Check if login was called with correct ID
//       expect(mockLoginFn).toHaveBeenCalledWith('1');
//     });

//     it('handles API errors gracefully', async () => {
//       // Override server handler to return an error
//       server.use(
//         rest.get('/api/users', (req, res, ctx) => {
//           return res(ctx.status(500));
//         })
//       );
      
//       const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
//       render(<Home />);
      
//       // Wait for loading state to finish
//       await waitFor(() => {
//         expect(screen.getByRole('combobox')).not.toBeDisabled();
//       });
      
//       expect(consoleSpy).toHaveBeenCalledWith(
//         'Failed to fetch users:',
//         expect.anything()
//       );
//       consoleSpy.mockRestore();
//     });
//   });

//   describe('when user is logged in', () => {
//     const loggedInUser = { id: '1', name: 'John Doe' };
    
//     beforeEach(() => {
//       (useAuth as jest.Mock).mockReturnValue({
//         user: loggedInUser,
//         login: mockLoginFn,
//         logout: mockLogoutFn,
//       });
//     });

//     it('displays welcome message with user name', () => {
//       render(<Home />);
//       expect(screen.getByText(`Welcome, ${loggedInUser.name}`)).toBeInTheDocument();
//     });

//     it('shows logout button when user is logged in', async () => {
//       render(<Home />);
      
//       const logoutButton = screen.getByText('Logout');
//       expect(logoutButton).toBeInTheDocument();
      
//       await userEvent.click(logoutButton);
//       expect(mockLogoutFn).toHaveBeenCalled();
//     });

//     it('renders the CollectionsList component', () => {
//       render(<Home />);
//       expect(screen.getByTestId('collections-list')).toBeInTheDocument();
//     });
//   });
// });