import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Clock, User, Calendar as CalendarIcon, LogOut, Phone, Mail, CheckCircle, X, MessageSquare } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAppointments, Appointment } from './AppointmentContext';
import { toast } from 'sonner';

interface BarberDashboardProps {
  onBackToHome: () => void;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

export function BarberDashboard({ onBackToHome }: BarberDashboardProps) {
  const { user, logout } = useAuth();
  const { getBarberAppointments, cancelAppointment, completeAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots.slice(0, 8));
  const [selectedTab, setSelectedTab] = useState('today');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  if (!user) return null;

  const allAppointments = getBarberAppointments(user.id);
  
  // Filter appointments by date
  const todayAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && appointment.status !== 'cancelled';
  });

  const completedAppointments = allAppointments.filter(appointment => 
    appointment.status === 'completed'
  );

  const cancelledAppointments = allAppointments.filter(appointment => 
    appointment.status === 'cancelled'
  );

  const toggleSlot = (slot: string) => {
    setAvailableSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot].sort()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleCancelAppointment = (appointmentId: string, reason: string) => {
    const success = cancelAppointment(appointmentId, 'barber', reason);
    if (success) {
      toast.success('Agendamento cancelado com sucesso');
      setSelectedAppointment(null);
      setCancelReason('');
    } else {
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    const success = completeAppointment(appointmentId);
    if (success) {
      toast.success('Agendamento marcado como concluído');
    } else {
      toast.error('Erro ao marcar agendamento como concluído');
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{appointment.time}</span>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{appointment.clientName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{appointment.clientPhone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{appointment.clientEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-medium mb-1 text-sm">Serviços</h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {appointment.services.map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-semibold">Total: R$ {appointment.totalPrice}</p>
          <p className="text-xs text-gray-500">Duração: {appointment.duration} min</p>
        </div>

        {appointment.notes && (
          <div className="mb-3">
            <h4 className="font-medium mb-1 text-sm">Observações</h4>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        )}

        {appointment.status === 'cancelled' && appointment.cancelledBy && (
          <div className="mb-3 p-2 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">
              Cancelado por: {appointment.cancelledBy === 'client' ? 'Cliente' : 'Barbeiro'}
            </p>
            {appointment.cancelReason && (
              <p className="text-sm text-red-600 mt-1">
                Motivo: {appointment.cancelReason}
              </p>
            )}
            {appointment.cancelledAt && (
              <p className="text-xs text-red-500 mt-1">
                Em: {new Date(appointment.cancelledAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleCompleteAppointment(appointment.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Concluir
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja cancelar este agendamento?
                    <br /><br />
                    <strong>Cliente:</strong> {appointment.clientName}<br />
                    <strong>Data:</strong> {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}<br />
                    <strong>Serviços:</strong> {appointment.services.join(', ')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="my-4">
                  <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
                  <Textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex: Emergência pessoal, problema de saúde, etc."
                    className="mt-2"
                    rows={3}
                  />
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setSelectedAppointment(null);
                    setCancelReason('');
                  }}>
                    Manter agendamento
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleCancelAppointment(appointment.id, cancelReason)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Calculate statistics
  const todayStats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
    pending: todayAppointments.filter(a => a.status === 'confirmed').length,
    revenue: todayAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.totalPrice, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">Dashboard do Barbeiro</h1>
                <p className="text-gray-600">Gerencie sua agenda e agendamentos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
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
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Disponível hoje</span>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{todayStats.total}</div>
                <div className="text-sm text-gray-600">Agendamentos Hoje</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{todayStats.completed}</div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{todayStats.pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">R$ {todayStats.revenue}</div>
                <div className="text-sm text-gray-600">Faturamento Hoje</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Calendário</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="today">Hoje ({todayAppointments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Próximos ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="completed">Concluídos ({completedAppointments.length})</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelados ({cancelledAppointments.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="today" className="mt-4">
                    {todayAppointments.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {todayAppointments.map((appointment) => (
                          <div key={appointment.id}>
                            <AppointmentCard appointment={appointment} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">Nenhum agendamento hoje</h3>
                        <p className="text-gray-600">Você não tem agendamentos para hoje.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upcoming" className="mt-4">
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {upcomingAppointments.map((appointment) => (
                          <div key={appointment.id}>
                            <AppointmentCard appointment={appointment} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">Nenhum agendamento próximo</h3>
                        <p className="text-gray-600">Você não tem agendamentos futuros.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="mt-4">
                    {completedAppointments.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {completedAppointments.map((appointment) => (
                          <div key={appointment.id}>
                            <AppointmentCard appointment={appointment} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">Nenhum agendamento concluído</h3>
                        <p className="text-gray-600">Você ainda não tem agendamentos concluídos.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cancelled" className="mt-4">
                    {cancelledAppointments.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {cancelledAppointments.map((appointment) => (
                          <div key={appointment.id}>
                            <AppointmentCard appointment={appointment} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">Nenhum agendamento cancelado</h3>
                        <p className="text-gray-600">Você não tem agendamentos cancelados.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Availability Management */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Gerenciar Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Selecione os horários disponíveis para {selectedDate?.toLocaleDateString('pt-BR')}
              </p>
              
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={availableSlots.includes(slot) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSlot(slot)}
                    className="justify-center"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Horários disponíveis:</span>
                  <span className="font-medium">{availableSlots.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}