import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, MapPin, Clock, Scissors } from 'lucide-react';

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

interface BarberCardProps {
  barber: Barber;
  onBook: () => void;
}

export function BarberCard({ barber, onBook }: BarberCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardContent className="p-6 h-full">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* Avatar and Basic Info */}
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={barber.avatar} alt={barber.name} />
              <AvatarFallback>
                <Scissors className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">{barber.name}</h3>
              
              <div className="flex items-center space-x-1 mb-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{barber.rating}</span>
                <span className="text-gray-500">({barber.reviewCount} avaliações)</span>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{barber.location}</span>
                <span className="text-sm">• {barber.distance}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-green-600 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{barber.nextAvailable}</span>
              </div>
            </div>
          </div>
          
          {/* Services and Prices */}
          <div className="flex-1 md:max-w-xs">
            <div className="mb-3">
              <h4 className="font-medium mb-2">Especialidades</h4>
              <div className="flex flex-wrap gap-1">
                {barber.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Serviços</h4>
              <div className="space-y-1">
                {barber.services.slice(0, 3).map((service) => (
                  <div key={service} className="flex justify-between text-sm">
                    <span>{service}</span>
                    <span className="font-medium">R$ {barber.prices[service]}</span>
                  </div>
                ))}
                {barber.services.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{barber.services.length - 3} outros serviços
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex flex-col justify-center md:justify-end md:items-end md:mt-auto">
            <Button onClick={onBook} className="w-full md:w-auto md:min-w-[100px]">
              Agendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}