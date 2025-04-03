import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

const GalloSelector = ({ gallos, selectedGalloId, onSelectGallo }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const selectedGallo = gallos.find(g => g.id_gallo === selectedGalloId);
  const filteredGallos = gallos.filter(g => 
    g.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50"
      >
        <span>{selectedGallo ? selectedGallo.nombre : 'Seleccionar gallo'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border"
          >
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar gallo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto">
                {filteredGallos.map((gallo) => (
                  <motion.button
                    key={gallo.id_gallo}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    onClick={() => {
                      onSelectGallo(gallo.id_gallo);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                      selectedGalloId === gallo.id_gallo ? 'bg-indigo-50 text-indigo-600' : ''
                    }`}
                  >
                    {gallo.nombre}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalloSelector;