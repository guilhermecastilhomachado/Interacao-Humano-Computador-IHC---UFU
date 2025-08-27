import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CalendarIcon, Clock, User, Phone, MessageSquare, Scissors, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useAppointments } from './AppointmentContext';

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
}

interface BookingModalProps {
  barber: Barber;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: (appointmentId: string) => void;
}

const availableTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export function BookingModal({ barber, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const { createAppointment } = useAppointments();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + barber.prices[service], 0);
  };

  const getTotalDuration = () => {
    const serviceDurations: { [key: string]: number } = {
      'Corte Masculino': 30,
      'Barba': 20,
      'Bigode': 10,
      'Sobrancelha': 10,
      'Relaxamento': 60
    };
    
    return selectedServices.reduce((total, service) => total + (serviceDurations[service] || 30), 0);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0 || !clientName || !clientPhone || !user) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Create appointment
    const appointmentId = createAppointment({
      barberId: barber.id,
      barberName: barber.name,
      barberAvatar: barber.avatar,
      barberLocation: barber.location,
      clientId: user.id,
      clientName,
      clientPhone,
      clientEmail: user.email,
      services: selectedServices,
      servicePrices: Object.fromEntries(
        selectedServices.map(service => [service, barber.prices[service]])
      ),
      totalPrice: getTotalPrice(),
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: getTotalDuration(),
      notes
    });

    toast.success('Agendamento realizado com sucesso!');
    
    // Call callback with appointment ID
    if (onBookingComplete) {
      onBookingComplete(appointmentId);
    }
    
    onClose();
    
    // Reset form
    setStep(1);
    setSelectedTime('');
    setSelectedServices([]);
    setClientName(user?.name || '');
    setClientPhone(user?.phone || '');
    setNotes('');
  };

  const nextStep = () => {
    if (step === 1 && (!selectedDate || !selectedTime || selectedServices.length === 0)) {
      toast.error('Selecione data, horário e pelo menos um serviço');
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  // Reset form when modal opens
  if (isOpen && user && (clientName !== user.name || clientPhone !== (user.phone || ''))) {
    setClientName(user.name);
    setClientPhone(user.phone || '');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click when typing
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={barber.avatar} alt={barber.name} />
              <AvatarFallback>
                <Scissors className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Agendar com {barber.name}</span>
          </DialogTitle>
          <DialogDescription>
            {barber.location} • {barber.distance}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Service Selection */}
            <div>
              <h3 className="font-semibold mb-3">Selecione os serviços</h3>
              <div className="grid grid-cols-1 gap-3">
                {barber.services.map((service) => (
                  <Card 
                    key={service}
                    className={`cursor-pointer transition-colors ${
                      selectedServices.includes(service) 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{service}</span>
                        <span className="font-semibold">R$ {barber.prices[service]}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedServices.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total: R$ {getTotalPrice()}</span>
                    <span className="text-sm text-gray-600">
                      Duração estimada: {getTotalDuration()} min
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="font-semibold mb-3">Selecione a data</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            <div>
              <h3 className="font-semibold mb-3">Selecione o horário</h3>
              <div className="grid grid-cols-4 gap-2">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="justify-center"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep} disabled={!selectedDate || !selectedTime || selectedServices.length === 0}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{selectedDate?.toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{selectedTime}</span>
                </div>
                <div>
                  <div className="font-medium mb-1">Serviços:</div>
                  {selectedServices.map((service) => (
                    <div key={service} className="flex justify-between text-sm">
                      <span>{service}</span>
                      <span>R$ {barber.prices[service]}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-semibold">
                    Total: R$ {getTotalPrice()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Confirme seus dados</h3>
              
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome completo"
                  disabled={!!user?.name} // Disable if user has name in profile
                />
                {user?.name && (
                  <p className="text-sm text-gray-500 mt-1">
                    Dados preenchidos automaticamente do seu perfil
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()} // Prevent dialog from closing on key events
                  placeholder="Alguma observação sobre o atendimento..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Voltar
              </Button>
              <Button onClick={handleBooking}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}