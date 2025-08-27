import { AppRouter } from './components/AppRouter';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AppointmentProvider } from './components/AppointmentContext';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthScreen />;
  }
  
  return <AppRouter />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <AppContent />
        <Toaster />
      </AppointmentProvider>
    </AuthProvider>
  );
}