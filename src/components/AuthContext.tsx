import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'barber' | 'client';
  avatar?: string;
  location?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, type: 'barber' | 'client') => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  type: 'barber' | 'client';
  phone?: string;
  location?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    email: 'carlos@barbeiro.com',
    type: 'barber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Centro, São Paulo',
    phone: '(11) 99999-9999'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@cliente.com',
    type: 'client',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '(11) 88888-8888'
  }
];

const mockPasswords: { [key: string]: string } = {
  'carlos@barbeiro.com': '123456',
  'joao@cliente.com': '123456'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, type: 'barber' | 'client'): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(u => u.email === email && u.type === type);
    const correctPassword = mockPasswords[email] === password;

    if (foundUser && correctPassword) {
      setUser(foundUser);
      return true;
    }

    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return false; // User already exists
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      type: userData.type,
      phone: userData.phone,
      location: userData.location
    };

    // Add to mock database
    mockUsers.push(newUser);
    mockPasswords[userData.email] = userData.password;

    // Log user in
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}