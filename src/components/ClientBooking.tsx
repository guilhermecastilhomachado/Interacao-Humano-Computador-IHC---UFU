import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ArrowLeft, Search, MapPin, Star, Clock, Scissors, SlidersHorizontal, User, LogOut, Calendar, Bell, X } from 'lucide-react';
import { BarberCard } from './BarberCard';
import { BookingModal } from './BookingModal';
import { FilterPanel, FilterState } from './FilterPanel';
import { AppointmentConfirmation } from './AppointmentConfirmation';
import { AppointmentsList } from './AppointmentsList';
import { useAuth } from './AuthContext';
import { useAppointments } from './AppointmentContext';

type ViewState = 'search' | 'confirmation' | 'appointments';

interface ClientBookingProps {
  onBackToHome: () => void;
}

interface Barber {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  services: string[];
  prices: { [key: string]: number };
  avatar: string;
  nextAvailable: string;
  specialties: string[];
  distanceKm: number; // Add for filtering
  availableTimeSlots: string[]; // Add for filtering
}

const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    rating: 4.8,
    reviewCount: 127,
    location: 'Centro, São Paulo',
    distance: '0.5 km',
    distanceKm: 0.5,
    services: ['Corte Masculino', 'Barba', 'Bigode', 'Sobrancelha'],
    prices: { 'Corte Masculino': 35, 'Barba': 25, 'Bigode': 15, 'Sobrancelha': 10 },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    nextAvailable: 'Hoje às 15:30',
    specialties: ['Cortes Clássicos', 'Barbas Estilizadas'],
    availableTimeSlots: ['08:00-12:00', '14:00', '15:30', '16:00', '16:30']
  },
  {
    id: '2',
    name: 'Roberto Silva',
    rating: 4.9,
    reviewCount: 203,
    location: 'Vila Madalena, São Paulo',
    distance: '1.2 km',
    distanceKm: 1.2,
    services: ['Corte Masculino', 'Barba', 'Relaxamento'],
    prices: { 'Corte Masculino': 40, 'Barba': 30, 'Relaxamento': 80 },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    nextAvailable: 'Amanhã às 09:00',
    specialties: ['Cortes Modernos', 'Tratamentos'],
    availableTimeSlots: ['08:00-12:00', '12:00-18:00', '09:00', '10:00', '11:00']
  },
  {
    id: '3',
    name: 'André Costa',
    rating: 4.7,
    reviewCount: 89,
    location: 'Pinheiros, São Paulo',
    distance: '2.1 km',
    distanceKm: 2.1,
    services: ['Corte Masculino', 'Barba', 'Bigode'],
    prices: { 'Corte Masculino': 32, 'Barba': 22, 'Bigode': 12 },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    nextAvailable: 'Hoje às 17:00',
    specialties: ['Cortes Tradicionais'],
    availableTimeSlots: ['12:00-18:00', '18:00-22:00', '17:00', '17:30', '18:00']
  },
  {
    id: '4',
    name: 'Fernando Barbosa',
    rating: 4.6,
    reviewCount: 156,
    location: 'Moema, São Paulo',
    distance: '3.5 km',
    distanceKm: 3.5,
    services: ['Corte Masculino', 'Barba', 'Relaxamento', 'Sobrancelha'],
    prices: { 'Corte Masculino': 45, 'Barba': 28, 'Relaxamento': 90, 'Sobrancelha': 12 },
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    nextAvailable: 'Hoje às 10:00',
    specialties: ['Cortes Premium', 'Relaxamento Capilar'],
    availableTimeSlots: ['08:00-12:00', '10:00', '10:30', '11:00']
  },
  {
    id: '5',
    name: 'Lucas Ferreira',
    rating: 4.5,
    reviewCount: 78,
    location: 'Itaim Bibi, São Paulo',
    distance: '4.8 km',
    distanceKm: 4.8,
    services: ['Corte Masculino', 'Barba'],
    prices: { 'Corte Masculino': 38, 'Barba': 25 },
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    nextAvailable: 'Amanhã às 14:00',
    specialties: ['Cortes Juvenis'],
    availableTimeSlots: ['12:00-18:00', '14:00', '14:30', '15:00', '15:30']
  }
];

const defaultFilters: FilterState = {
  selectedDate: undefined,
  selectedTimeSlots: [],
  minRating: 0,
  maxDistance: 50,
  priceRange: [0, 200]
};

export function ClientBooking({ onBackToHome }: ClientBookingProps) {
  const { user, logout } = useAuth();
  const { getUserAppointments, appointments } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>(() => {
    // Initialize with a date from 7 days ago to catch existing cancellations
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return oneWeekAgo.toISOString();
  });

  // Check for new cancellations by barber
  useEffect(() => {
    if (!user) return;
    
    const userAppointments = getUserAppointments(user.id);
    const cancelledByBarberAppointments = userAppointments.filter(appointment => 
      appointment.status === 'cancelled' && 
      appointment.cancelledBy === 'barber' &&
      appointment.cancelledAt &&
      new Date(appointment.cancelledAt) > new Date(lastCheckedTime)
    );

    if (cancelledByBarberAppointments.length > 0) {
      const newNotifications = cancelledByBarberAppointments.map(appointment => ({
        id: appointment.id,
        type: 'cancellation',
        title: 'Agendamento Cancelado',
        message: `Seu agendamento com ${appointment.barberName} foi cancelado`,
        reason: appointment.cancelReason,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        timestamp: appointment.cancelledAt,
        read: false
      }));

      setNotifications(prev => [...newNotifications, ...prev]);
    }
  }, [user, lastCheckedTime, getUserAppointments, appointments]); // Added appointments as dependency

  // Mark notifications as read
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setLastCheckedTime(new Date().toISOString());
  };

  const filteredBarbers = mockBarbers.filter(barber => {
    // Text search
    const matchesSearch = searchQuery === '' || 
      barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      barber.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      barber.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    // Date filter (for now, we'll assume all barbers are available on selected date)
    const matchesDate = !filters.selectedDate || true;

    // Time filter
    const matchesTime = filters.selectedTimeSlots.length === 0 || 
      filters.selectedTimeSlots.some(selectedSlot => 
        barber.availableTimeSlots.some(availableSlot => 
          selectedSlot.includes('-') ? // Period filter
            availableSlot === selectedSlot :
            availableSlot === selectedSlot || availableSlot.includes(selectedSlot)
        )
      );

    // Rating filter
    const matchesRating = barber.rating >= filters.minRating;

    // Distance filter
    const matchesDistance = barber.distanceKm <= filters.maxDistance;

    // Price filter (check minimum price of barber's services)
    const minPrice = Math.min(...Object.values(barber.prices));
    const maxPrice = Math.max(...Object.values(barber.prices));
    const matchesPrice = minPrice <= filters.priceRange[1] && maxPrice >= filters.priceRange[0];

    return matchesSearch && matchesDate && matchesTime && matchesRating && matchesDistance && matchesPrice;
  });

  const userAppointments = user ? getUserAppointments(user.id) : [];
  const upcomingAppointmentsCount = userAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && appointment.status !== 'cancelled';
  }).length;

  const handleBooking = (barber: Barber) => {
    setSelectedBarber(barber);
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = (appointmentId: string) => {
    setCurrentAppointmentId(appointmentId);
    setCurrentView('confirmation');
    setIsBookingModalOpen(false);
    setSelectedBarber(null);
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setCurrentAppointmentId(null);
  };

  const handleViewAppointments = () => {
    setCurrentView('appointments');
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  if (currentView === 'confirmation' && currentAppointmentId) {
    return (
      <AppointmentConfirmation
        appointmentId={currentAppointmentId}
        onClose={handleBackToSearch}
        onViewAppointments={handleViewAppointments}
      />
    );
  }

  if (currentView === 'appointments') {
    return (
      <AppointmentsList
        onClose={handleBackToSearch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1>Encontrar Barbeiros</h1>
                <p className="text-muted-foreground">Encontre os melhores barbeiros na sua região</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {upcomingAppointmentsCount > 0 && (
                <Button variant="outline" onClick={handleViewAppointments}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Meus Agendamentos
                  <Badge variant="secondary" className="ml-2">
                    {upcomingAppointmentsCount}
                  </Badge>
                </Button>
              )}
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      markNotificationsAsRead();
                    }
                  }}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notifications.filter(n => !n.read).length}
                    </Badge>
                  )}
                </Button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notificações</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Nenhuma notificação
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <X className="h-4 w-4 text-red-600" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.appointmentDate} às {notification.appointmentTime}
                                </p>
                                {notification.reason && (
                                  <p className="text-xs text-red-600 mt-1 italic">
                                    Motivo: {notification.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={logout}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, localização ou especialidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {(filters.selectedDate || filters.selectedTimeSlots.length > 0 || 
                filters.minRating > 0 || filters.maxDistance < 50 || 
                filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
                <Badge variant="secondary" className="ml-2">
                  Ativos
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
              resultCount={filteredBarbers.length}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2>
                  {filteredBarbers.length} barbeiro{filteredBarbers.length !== 1 ? 's' : ''} encontrado{filteredBarbers.length !== 1 ? 's' : ''}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(filters.selectedDate || filters.selectedTimeSlots.length > 0 || 
                filters.minRating > 0 || filters.maxDistance < 50 ||
                filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.selectedDate && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{filters.selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                    </Badge>
                  )}
                  {filters.selectedTimeSlots.map(slot => (
                    <Badge key={slot} variant="secondary">
                      {slot.includes('-') ? 
                        slot === '08:00-12:00' ? 'Manhã' :
                        slot === '12:00-18:00' ? 'Tarde' : 'Noite'
                        : slot}
                    </Badge>
                  ))}
                  {filters.minRating > 0 && (
                    <Badge variant="secondary">
                      {filters.minRating.toFixed(1)}+ ⭐
                    </Badge>
                  )}
                  {filters.maxDistance < 50 && (
                    <Badge variant="secondary">
                      até {filters.maxDistance} km
                    </Badge>
                  )}
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
                    <Badge variant="secondary">
                      R$ {filters.priceRange[0]} - {filters.priceRange[1]}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {filteredBarbers.map((barber) => (
                <div key={barber.id}>
                  <BarberCard
                    barber={barber}
                    onBook={() => handleBooking(barber)}
                  />
                </div>
              ))}
            </div>

            {filteredBarbers.length === 0 && (
              <div className="text-center py-12">
                <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3>Nenhum barbeiro encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Dialog */}
      <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Encontre barbeiros que atendem suas necessidades
            </DialogDescription>
          </DialogHeader>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            resultCount={filteredBarbers.length}
          />
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowMobileFilters(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={() => setShowMobileFilters(false)} className="flex-1">
              Ver Resultados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedBarber && (
        <BookingModal 
          barber={selectedBarber}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedBarber(null);
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}