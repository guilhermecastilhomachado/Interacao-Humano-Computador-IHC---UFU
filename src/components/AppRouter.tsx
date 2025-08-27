import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Scissors, User, LogOut } from 'lucide-react';
import { BarberDashboard } from './BarberDashboard';
import { ClientBooking } from './ClientBooking';
import { useAuth } from './AuthContext';

type UserType = 'barber' | 'client' | null;

export function AppRouter() {
  const { user, logout } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);

  // Redirect automatically based on user type after login
  useEffect(() => {
    if (user && !userType) {
      setUserType(user.type);
    }
  }, [user, userType]);

  // Reset userType when user changes
  useEffect(() => {
    if (!user) {
      setUserType(null);
    }
  }, [user]);

  // Show loading state while determining user type
  if (user && !userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (userType === 'barber') {
    return <BarberDashboard onBackToHome={() => {
      if (user?.type === 'barber') {
        // If user is a barber, they can only access barber dashboard
        logout();
      } else {
        setUserType(null);
      }
    }} />;
  }

  if (userType === 'client') {
    return <ClientBooking onBackToHome={() => {
      if (user?.type === 'client') {
        // If user is a client, they can only access client booking
        logout();
      } else {
        setUserType(null);
      }
    }} />;
  }

  // This should never be reached since AuthScreen is shown when user is not authenticated
  return null;
}