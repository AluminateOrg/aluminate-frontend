'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrgProvider } from '@/contexts/OrgContext';
import { Toaster } from '@/components/ui/sonner';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/redux/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <OrgProvider>
            {children}
            <Toaster />
          </OrgProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
