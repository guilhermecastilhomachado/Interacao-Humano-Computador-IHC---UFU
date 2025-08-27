import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Calendar as CalendarIcon, Clock, Star, MapPin, DollarSign, RotateCcw } from 'lucide-react';

export interface FilterState {
  selectedDate: Date | undefined;
  selectedTimeSlots: string[];
  minRating: number;
  maxDistance: number;
  priceRange: [number, number];
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

const timeSlots = [
  { id: 'morning', label: 'Manhã (08:00 - 12:00)', value: '08:00-12:00' },
  { id: 'afternoon', label: 'Tarde (12:00 - 18:00)', value: '12:00-18:00' },
  { id: 'evening', label: 'Noite (18:00 - 22:00)', value: '18:00-22:00' }
];

const specificTimes = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export function FilterPanel({ filters, onFiltersChange, onReset, resultCount }: FilterPanelProps) {
  const [isDateOpen, setIsDateOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isDistanceOpen, setIsDistanceOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [showSpecificTimes, setShowSpecificTimes] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTimeSlot = (timeSlot: string) => {
    const newTimeSlots = filters.selectedTimeSlots.includes(timeSlot)
      ? filters.selectedTimeSlots.filter(slot => slot !== timeSlot)
      : [...filters.selectedTimeSlots, timeSlot];
    
    updateFilters({ selectedTimeSlots: newTimeSlots });
  };

  const toggleSpecificTime = (time: string) => {
    const newTimeSlots = filters.selectedTimeSlots.includes(time)
      ? filters.selectedTimeSlots.filter(slot => slot !== time)
      : [...filters.selectedTimeSlots, time];
    
    updateFilters({ selectedTimeSlots: newTimeSlots });
  };

  const hasActiveFilters = 
    filters.selectedDate || 
    filters.selectedTimeSlots.length > 0 || 
    filters.minRating > 0 || 
    filters.maxDistance < 50 ||
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 200;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {resultCount} barbeiro{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Data */}
        <Collapsible open={isDateOpen} onOpenChange={setIsDateOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium">Data</span>
                {filters.selectedDate && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Calendar
              mode="single"
              selected={filters.selectedDate}
              onSelect={(date) => updateFilters({ selectedDate: date })}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Horário */}
        <Collapsible open={isTimeOpen} onOpenChange={setIsTimeOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Horário</span>
                {filters.selectedTimeSlots.length > 0 && (
                  <Badge variant="secondary">
                    {filters.selectedTimeSlots.length}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isTimeOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Períodos</div>
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={filters.selectedTimeSlots.includes(slot.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTimeSlot(slot.value)}
                    className="w-full justify-start text-xs"
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpecificTimes(!showSpecificTimes)}
                className="text-xs text-muted-foreground"
              >
                {showSpecificTimes ? 'Ocultar' : 'Ver'} horários específicos
              </Button>
              
              {showSpecificTimes && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {specificTimes.map((time) => (
                    <Button
                      key={time}
                      variant={filters.selectedTimeSlots.includes(time) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSpecificTime(time)}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Avaliação */}
        <Collapsible open={isRatingOpen} onOpenChange={setIsRatingOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span className="font-medium">Avaliação mínima</span>
                {filters.minRating > 0 && (
                  <Badge variant="secondary">
                    {filters.minRating}+ ⭐
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isRatingOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => updateFilters({ minRating: value })}
                max={5}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Qualquer</span>
                <span className="font-medium">{filters.minRating.toFixed(1)}+ estrelas</span>
                <span>5.0</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Distância */}
        <Collapsible open={isDistanceOpen} onOpenChange={setIsDistanceOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Distância máxima</span>
                {filters.maxDistance < 50 && (
                  <Badge variant="secondary">
                    {filters.maxDistance} km
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isDistanceOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              <Slider
                value={[filters.maxDistance]}
                onValueChange={([value]) => updateFilters({ maxDistance: value })}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 km</span>
                <span className="font-medium">até {filters.maxDistance} km</span>
                <span>50+ km</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Faixa de Preço */}
        <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Faixa de preço</span>
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
                  <Badge variant="secondary">
                    R$ {filters.priceRange[0]} - {filters.priceRange[1]}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>R$ 0</span>
                <span className="font-medium">
                  R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
                </span>
                <span>R$ 200+</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}