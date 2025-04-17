import { render } from '../test-utils';
import RootLayout from './layout';
import { Metadata } from 'next';

// Mock the font to avoid actual font loading
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mocked-font-class',
    style: { fontFamily: 'mocked-font' },
  }),
}));

// Mock the Toaster component
jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="mock-toaster">Mocked Toaster</div>,
}));

// Mock the AuthProvider component
jest.mock('./providers', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-auth-provider">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('renders children within the layout structure', () => {
    jest.resetModules();
    jest.doMock('./layout', () => ({
      __esModule: true,
      default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }));
    const { render } = require('../test-utils');
    const RootLayout = require('./layout').default;

    const { container, getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(container).toHaveTextContent('Test Content');
    expect(getByTestId('mock-auth-provider')).toBeInTheDocument();
    expect(getByTestId('mock-toaster')).toBeInTheDocument();
  });

  it('has correct metadata', () => {
    const metadata = require('./layout').metadata as Metadata;
    
    expect(metadata.title).toBe('Bidding System');
    expect(metadata.description).toBe(
      'A simple bidding system built with Next.js, Shadcn/UI, and Prisma'
    );
  });
});