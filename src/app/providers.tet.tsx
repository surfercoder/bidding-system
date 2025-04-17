// // providers.test.tsx
// import { render, screen, waitFor, act } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { rest } from 'msw';
// import { setupServer } from 'msw/node';
// import { AuthProvider, useAuth } from './providers';

// // Mock fetch and localStorage
// const localStorageMock = (() => {
//   let store: Record<string, string> = {};
//   return {
//     getItem: jest.fn((key: string) => store[key] || null),
//     setItem: jest.fn((key: string, value: string) => {
//       store[key] = value;
//     }),
//     removeItem: jest.fn((key: string) => {
//       delete store[key];
//     }),
//     clear: jest.fn(() => {
//       store = {};
//     }),
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// // Test user data
// const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };

// // Setup MSW server
// const server = setupServer(
//   rest.get('/api/users/:userId', (req, res, ctx) => {
//     const { userId } = req.params;
//     if (userId === '1') {
//       return res(ctx.json({ user: mockUser }));
//     }
//     return res(ctx.status(404), ctx.json({ message: 'User not found' }));
//   })
// );

// // Test component that uses the auth context
// function TestComponent() {
//   const { user, login, logout, isLoading } = useAuth();
  
//   return (
//     <div>
//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <>
//           {user ? (
//             <div>
//               <p data-testid="user-info">
//                 Logged in as {user.name} ({user.email})
//               </p>
//               <button onClick={logout}>Logout</button>
//             </div>
//           ) : (
//             <div>
//               <p>Not logged in</p>
//               <button onClick={() => login('1')}>Login as User 1</button>
//               <button onClick={() => login('999')}>Login as Invalid User</button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// describe('AuthProvider', () => {
//   beforeAll(() => {
//     server.listen();
//   });
  
//   afterEach(() => {
//     server.resetHandlers();
//     localStorageMock.clear();
//     jest.clearAllMocks();
//   });
  
//   afterAll(() => {
//     server.close();
//   });

//   it('throws error when useAuth is used outside of AuthProvider', () => {
//     // Suppress expected error log
//     const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
//     expect(() => {
//       render(<TestComponent />);
//     }).toThrow('useAuth must be used within an AuthProvider');
    
//     consoleErrorSpy.mockRestore();
//   });

//   it('initializes with no user and loading state', async () => {
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );
    
//     // Initially shows loading
//     expect(screen.getByText('Loading...')).toBeInTheDocument();
    
//     // Then shows not logged in state
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
//   });

//   it('loads user from localStorage on initial render', async () => {
//     // Setup localStorage with a stored user
//     localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
    
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );
    
//     await waitFor(() => {
//       expect(screen.getByTestId('user-info')).toHaveTextContent(`Logged in as ${mockUser.name} (${mockUser.email})`);
//     });
    
//     expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
//   });

//   it('successfully logs in a user', async () => {
//     const user = userEvent.setup();
    
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );
    
//     // Wait for loading to complete
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
    
//     // Click login button
//     await user.click(screen.getByText('Login as User 1'));
    
//     // Verify user is logged in
//     await waitFor(() => {
//       expect(screen.getByTestId('user-info')).toHaveTextContent(`Logged in as ${mockUser.name} (${mockUser.email})`);
//     });
    
//     // Check localStorage was updated
//     expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
//   });

//   it('handles login error gracefully', async () => {
//     const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
//     const user = userEvent.setup();
    
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );
    
//     // Wait for loading to complete
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
    
//     // Click invalid login button
//     await user.click(screen.getByText('Login as Invalid User'));
    
//     // User should still be not logged in
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
    
//     expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.anything());
//     consoleSpy.mockRestore();
//   });

//   it('successfully logs out a user', async () => {
//     // Start with logged in user
//     localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
    
//     const user = userEvent.setup();
    
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );
    
//     // Verify user is logged in
//     await waitFor(() => {
//       expect(screen.getByTestId('user-info')).toBeInTheDocument();
//     });
    
//     // Click logout button
//     await user.click(screen.getByText('Logout'));
    
//     // Verify user is logged out
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
    
//     // Check localStorage was updated
//     expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
//   });

//   it('handles fetch errors during login', async () => {
//     // Override server to simulate network error
//     server.use(
//       rest.get('/api/users/:userId', (req, res) => {
//         return res.networkError('Failed to connect');
//       })
//     );
    
//     const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
//     const user = userEvent.setup();
    
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );
    
//     // Wait for loading to complete
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
    
//     // Click login button
//     await user.click(screen.getByText('Login as User 1'));
    
//     // User should still be not logged in
//     await waitFor(() => {
//       expect(screen.getByText('Not logged in')).toBeInTheDocument();
//     });
    
//     expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.anything());
//     consoleSpy.mockRestore();
//   });
// });