import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Appointment {
  id: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  barberLocation: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  services: string[];
  servicePrices: { [key: string]: number };
  totalPrice: number;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  createdAt: string;
  notes?: string;
  cancelledBy?: 'client' | 'barber';
  cancelledAt?: string;
  cancelReason?: string;
}

interface AppointmentContextType {
  appointments: Appointment[];
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => string;
  cancelAppointment: (appointmentId: string, cancelledBy?: 'client' | 'barber', reason?: string) => boolean;
  getAppointmentById: (appointmentId: string) => Appointment | undefined;
  getUserAppointments: (userId: string) => Appointment[];
  getBarberAppointments: (barberId: string) => Appointment[];
  completeAppointment: (appointmentId: string) => boolean;
  exportAppointmentsToJSON: () => string;
  importAppointmentsFromJSON: (jsonData: string) => boolean;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Storage key for localStorage
const STORAGE_KEY = 'barbearia_appointments';

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from localStorage on component mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save appointments to localStorage whenever appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      saveToStorage();
    }
  }, [appointments]);

  const saveToStorage = () => {
    try {
      const jsonData = JSON.stringify(appointments, null, 2);
      localStorage.setItem(STORAGE_KEY, jsonData);
      console.log('Appointments saved to localStorage:', appointments.length, 'items');
    } catch (error) {
      console.error('Error saving appointments to localStorage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedAppointments = JSON.parse(savedData) as Appointment[];
        setAppointments(parsedAppointments);
        console.log('Appointments loaded from localStorage:', parsedAppointments.length, 'items');
      }
    } catch (error) {
      console.error('Error loading appointments from localStorage:', error);
    }
  };

  const exportAppointmentsToJSON = (): string => {
    return JSON.stringify(appointments, null, 2);
  };

  const importAppointmentsFromJSON = (jsonData: string): boolean => {
    try {
      const parsedAppointments = JSON.parse(jsonData) as Appointment[];
      setAppointments(parsedAppointments);
      return true;
    } catch (error) {
      console.error('Error importing appointments from JSON:', error);
      return false;
    }
  };

  const createAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): string => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    setAppointments(prev => {
      const updated = [...prev, newAppointment];
      console.log('New appointment created:', newAppointment.id, 'for barber:', newAppointment.barberName);
      return updated;
    });
    return newAppointment.id;
  };

  const cancelAppointment = (appointmentId: string, cancelledBy: 'client' | 'barber' = 'client', reason?: string): boolean => {
    setAppointments(prev => {
      const updated = prev.map(appointment => 
        appointment.id === appointmentId 
          ? { 
              ...appointment, 
              status: 'cancelled' as const,
              cancelledBy,
              cancelledAt: new Date().toISOString(),
              cancelReason: reason
            }
          : appointment
      );
      console.log('Appointment cancelled:', appointmentId, 'by:', cancelledBy);
      return updated;
    });
    return true;
  };

  const completeAppointment = (appointmentId: string): boolean => {
    setAppointments(prev => {
      const updated = prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: 'completed' as const }
          : appointment
      );
      console.log('Appointment completed:', appointmentId);
      return updated;
    });
    return true;
  };

  const getAppointmentById = (appointmentId: string): Appointment | undefined => {
    return appointments.find(appointment => appointment.id === appointmentId);
  };

  const getUserAppointments = (userId: string): Appointment[] => {
    return appointments
      .filter(appointment => appointment.clientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getBarberAppointments = (barberId: string): Appointment[] => {
    const barberAppointments = appointments
      .filter(appointment => appointment.barberId === barberId)
      .sort((a, b) => {
        // Sort by date first, then by time
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA.getTime() - dateB.getTime();
      });
    
    console.log(`Found ${barberAppointments.length} appointments for barber ${barberId}`);
    return barberAppointments;
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      createAppointment,
      cancelAppointment,
      getAppointmentById,
      getUserAppointments,
      getBarberAppointments,
      completeAppointment,
      exportAppointmentsToJSON,
      importAppointmentsFromJSON,
      saveToStorage,
      loadFromStorage
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}