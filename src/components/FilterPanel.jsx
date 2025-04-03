import React from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';

const FilterPanel = ({ filters, setFilters }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const eventTypes = [
    { id: 'peleas', label: 'Peleas' },
    { id: 'entrenamientos', label: 'Entrenamientos' },
    { id: 'cuidadosMedicos', label: 'Cuidados Médicos' },
    { id: 'alimentacion', label: 'Alimentación' },
    { id: 'higiene', label: 'Higiene' }
  ];

  const handleDateChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const toggleEventType = (typeId) => {
    setFilters(prev => ({
      ...prev,
      eventTypes: {
        ...prev.eventTypes,
        [typeId]: !prev.eventTypes[typeId]
      }
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50"
      >
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium">Filtros</span>
        </div>
        {Object.values(filters.eventTypes).some(v => v) && (
          <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
            Activos
          </span>
        )}
      </button>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 border-t">
          {/* Date Range */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Rango de fechas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Event Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tipos de eventos</h3>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleEventType(type.id)}
                  className={`px-3 py-1.5 text-sm rounded-full flex items-center ${
                    filters.eventTypes[type.id]
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                  {filters.eventTypes[type.id] && (
                    <X className="w-3 h-3 ml-1.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterPanel;