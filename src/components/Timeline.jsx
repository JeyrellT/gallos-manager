import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Heart, Award, Dumbbell, Utensils, Droplet, Scale, ZoomIn, ZoomOut } from 'lucide-react';

const EventTypeIcons = {
  'Cuidado Médico': Heart,
  'Pelea': Award,
  'Entrenamiento': Dumbbell,
  'Alimentación': Utensils,
  'Higiene': Droplet,
  'Control Peso': Scale
};

const Timeline = ({ events }) => {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef(null);
  const [tooltipEvent, setTooltipEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = format(new Date(event.fecha), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  const handleMouseEnter = (event, e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipEvent(event);
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });
  };

  const handleMouseLeave = () => {
    setTooltipEvent(null);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Línea de Tiempo</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ '--zoom-level': zoom }}
      >
        <div className="min-w-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'left top' }}>
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date} className="relative flex items-start mb-4">
              <div className="flex-shrink-0 w-32">
                <span className="text-sm font-medium text-gray-600">
                  {format(new Date(date), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex-grow pl-4 border-l border-gray-200">
                <div className="space-y-2">
                  {dayEvents.map((event, index) => {
                    const Icon = EventTypeIcons[event.tipo] || Award;
                    return (
                      <motion.div
                        key={`${date}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        <div
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onMouseEnter={(e) => handleMouseEnter(event, e)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <Icon className={`w-5 h-5 ${
                            event.tipo === 'Cuidado Médico' ? 'text-red-500' :
                            event.tipo === 'Pelea' ? 'text-yellow-500' :
                            event.tipo === 'Entrenamiento' ? 'text-green-500' :
                            event.tipo === 'Alimentación' ? 'text-orange-500' :
                            event.tipo === 'Higiene' ? 'text-blue-500' :
                            'text-purple-500'
                          }`} />
                          <span className="text-sm text-gray-600">{event.descripcion}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tooltipEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed z-50 bg-white p-3 rounded-lg shadow-lg border text-sm"
          style={{
            left: tooltipPosition.x + 'px',
            top: tooltipPosition.y + 'px',
            transform: 'translate(20px, -50%)',
            maxWidth: '300px'
          }}
        >
          <div className="font-medium text-gray-900 mb-1">
            {tooltipEvent.tipo}
          </div>
          <div className="text-gray-600">
            {tooltipEvent.descripcion}
          </div>
          {tooltipEvent.gallo && (
            <div className="text-gray-500 mt-1">
              Gallo: {tooltipEvent.gallo.nombre}
            </div>
          )}
          {tooltipEvent.resultado && (
            <div className={`mt-1 ${
              tooltipEvent.resultado === 'Victoria' ? 'text-green-600' :
              tooltipEvent.resultado === 'Derrota' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              Resultado: {tooltipEvent.resultado}
            </div>
          )}
          {tooltipEvent.duracion_min && (
            <div className="text-gray-500 mt-1">
              Duración: {tooltipEvent.duracion_min} minutos
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Timeline;