// import { render } from '../test-utils';
// import RootLayout from './layout';
// import { Metadata } from 'next';

// // Mock the font to avoid actual font loading
// jest.mock('next/font/google', () => ({
//   Inter: () => ({
//     className: 'mocked-font-class',
//     style: { fontFamily: 'mocked-font' },
//   }),
// }));

// // Mock the Toaster component
// jest.mock('@/components/ui/sonner', () => ({
//   Toaster: () => <div data-testid="mock-toaster">Mocked Toaster</div>,
// }));

// // Mock the AuthProvider component
// jest.mock('./providers', () => ({
//   AuthProvider: ({ children }: { children: React.ReactNode }) => (
//     <div data-testid="mock-auth-provider">{children}</div>
//   ),
// }));

// describe('RootLayout', () => {
//   it('renders children within the layout structure', () => {
//     const { container, getByTestId } = render(
//       <RootLayout>
//         <div>Test Content</div>
//       </RootLayout>
//     );

//     // Verify that the layout structure is correct
//     const body = container.querySelector('body');
//     expect(body).toHaveClass('mocked-font-class');

//     // Verify that children are rendered
//     expect(container.querySelector('body')).toHaveTextContent('Test Content');

//     // Verify that required components are present
//     expect(getByTestId('mock-auth-provider')).toBeInTheDocument();
//     expect(getByTestId('mock-toaster')).toBeInTheDocument();
//   });

//   it('has correct metadata', () => {
//     const metadata = require('./layout').metadata as Metadata;
    
//     expect(metadata.title).toBe('Bidding System');
//     expect(metadata.description).toBe(
//       'A simple bidding system built with Next.js, Shadcn/UI, and Prisma'
//     );
//   });
// });