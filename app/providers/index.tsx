import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ReactQueryProvider } from './ReactQueryProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </AuthProvider>
  );
} 