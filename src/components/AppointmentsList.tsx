import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { CalendarIcon, Clock, MapPin, Phone, Scissors, X, ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAppointments, Appointment } from './AppointmentContext';
import { toast } from 'sonner@2.0.3';

interface AppointmentsListProps {
  onClose: () => void;
}

export function AppointmentsList({ onClose }: AppointmentsListProps) {
  const { user } = useAuth();
  const { getUserAppointments, cancelAppointment } = useAppointments();
  const [selectedTab, setSelectedTab] = useState('upcoming');

  if (!user) {
    return null;
  }

  const allAppointments = getUserAppointments(user.id);
  
  const upcomingAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && appointment.status !== 'cancelled';
  });

  const pastAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate < today || appointment.status === 'completed';
  });

  const cancelledAppointments = allAppointments.filter(appointment => 
    appointment.status === 'cancelled'
  );

  const handleCancelAppointment = (appointmentId: string) => {
    const success = cancelAppointment(appointmentId, 'client');
    if (success) {
      toast.success('Agendamento cancelado com sucesso');
    } else {
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Concluído</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={appointment.barberAvatar} alt={appointment.barberName} />
              <AvatarFallback>
                <Scissors className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{appointment.barberName}</h3>
              <p className="text-sm text-gray-600">{appointment.barberLocation}</p>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {new Date(appointment.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{appointment.time} ({appointment.duration} min)</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2 text-sm">Serviços</h4>
          <div className="flex flex-wrap gap-1">
            {appointment.services.map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-semibold mt-2">Total: R$ {appointment.totalPrice}</p>
        </div>

        {appointment.notes && (
          <div className="mb-4">
            <h4 className="font-medium mb-1 text-sm">Observações</h4>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        )}

        {appointment.status === 'cancelled' && appointment.cancelledBy && (
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">
              Cancelado por: {appointment.cancelledBy === 'client' ? 'Você' : 'Barbeiro'}
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
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja cancelar este agendamento?
                    <br /><br />
                    <strong>Barbeiro:</strong> {appointment.barberName}<br />
                    <strong>Data:</strong> {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Manter agendamento</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleCancelAppointment(appointment.id)}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1>Meus Agendamentos</h1>
              <p className="text-muted-foreground">Gerencie todos os seus agendamentos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Próximos ({upcomingAppointments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Histórico ({pastAppointments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center space-x-2">
              <X className="h-4 w-4" />
              <span>Cancelados ({cancelledAppointments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length > 0 ? (
              <div>
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Nenhum agendamento próximo</h3>
                <p className="text-gray-600 mb-4">Você não tem agendamentos futuros no momento.</p>
                <Button onClick={onClose}>Buscar barbeiros</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length > 0 ? (
              <div>
                {pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Nenhum histórico</h3>
                <p className="text-gray-600">Você ainda não tem agendamentos anteriores.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledAppointments.length > 0 ? (
              <div>
                {cancelledAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Nenhum agendamento cancelado</h3>
                <p className="text-gray-600">Você não tem agendamentos cancelados.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}