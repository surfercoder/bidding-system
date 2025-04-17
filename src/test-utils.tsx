import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';
import { AuthProvider } from '@/app/providers';

const customRender = (ui: ReactElement, options = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render };