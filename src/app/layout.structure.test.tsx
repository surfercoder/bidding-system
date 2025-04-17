import { render } from '../test-utils';
// Mock RootLayout to only render children for testing
jest.mock('./layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import RootLayout from './layout';

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

describe('RootLayout structure', () => {
  it('renders children within the layout structure', () => {
    const { container, getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(container).toHaveTextContent('Test Content');
    expect(getByTestId('mock-auth-provider')).toBeInTheDocument();
    expect(getByTestId('mock-toaster')).toBeInTheDocument();
  });
});
