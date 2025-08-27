import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { CheckCircle, CalendarIcon, Clock, MapPin, Phone, Mail, User, Scissors, X, ArrowLeft } from 'lucide-react';
import { useAppointments, Appointment } from './AppointmentContext';
import { toast } from 'sonner@2.0.3';

interface AppointmentConfirmationProps {
  appointmentId: string;
  onClose: () => void;
  onViewAppointments?: () => void;
}

export function AppointmentConfirmation({ appointmentId, onClose, onViewAppointments }: AppointmentConfirmationProps) {
  const { getAppointmentById, cancelAppointment } = useAppointments();
  
  const appointment = getAppointmentById(appointmentId);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Agendamento não encontrado</h3>
            <p className="text-gray-600 mb-4">O agendamento que você está procurando não existe.</p>
            <Button onClick={onClose}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancelAppointment = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Agendamento {appointment.status === 'cancelled' ? 'Cancelado' : 'Confirmado'}!
          </h1>
          <p className="text-gray-600">
            {appointment.status === 'cancelled' 
              ? 'Seu agendamento foi cancelado com sucesso.'
              : 'Seu agendamento foi criado com sucesso. Você receberá uma confirmação em breve.'
            }
          </p>
        </div>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={appointment.barberAvatar} alt={appointment.barberName} />
                  <AvatarFallback>
                    <Scissors className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span>{appointment.barberName}</span>
              </CardTitle>
              {getStatusBadge(appointment.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(appointment.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{appointment.time}</p>
                  <p className="text-sm text-gray-600">Duração: {appointment.duration} min</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <p>{appointment.barberLocation}</p>
            </div>

            {/* Services */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Serviços agendados</h4>
              <div className="space-y-2">
                {appointment.services.map((service) => (
                  <div key={service} className="flex justify-between items-center">
                    <span>{service}</span>
                    <span className="font-medium">R$ {appointment.servicePrices[service]}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>R$ {appointment.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Informações de contato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{appointment.clientName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{appointment.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Observações</h4>
                <p className="text-gray-600">{appointment.notes}</p>
              </div>
            )}

            {/* Cancellation Info */}
            {appointment.status === 'cancelled' && appointment.cancelledBy && (
              <div className="border-t pt-4">
                <div className="p-3 bg-red-50 rounded-md">
                  <h4 className="font-medium mb-2 text-red-800">Informações do cancelamento</h4>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à busca
          </Button>
          
          {onViewAppointments && (
            <Button variant="outline" onClick={onViewAppointments} className="flex-1">
              Ver todos agendamentos
            </Button>
          )}
          
          {appointment.status === 'confirmed' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar agendamento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                    <br /><br />
                    <strong>Agendamento:</strong> {appointment.barberName} - {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Manter agendamento</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelAppointment}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Booking ID */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ID do agendamento: <span className="font-mono">{appointmentId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}