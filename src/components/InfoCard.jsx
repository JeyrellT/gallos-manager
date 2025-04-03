import React from 'react';
import { useData } from '../contexts/DataContext';

const InfoCard = ({ gallo }) => {
  const { controlPesos } = useData();

  // Obtener el peso más reciente del gallo de los registros de control de peso
  const pesosMasRecientes = controlPesos
    .filter(peso => peso.id_gallo === gallo.id_gallo)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
  const pesoActual = pesosMasRecientes.length > 0 ? pesosMasRecientes[0].peso_g : gallo.peso_actual;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-gray-700 mb-3">Información Básica</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Estado:</span>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            gallo.estado === 'Activo' 
              ? 'bg-green-100 text-green-800' 
              : gallo.estado === 'Lesionado'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>{gallo.estado}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Peso actual:</span>
          <span>{pesoActual || 'N/A'} g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Fecha de nacimiento:</span>
          <span>{gallo.fecha_nacimiento || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Sexo:</span>
          <span>{gallo.sexo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Línea genética:</span>
          <span>{gallo.linea_genetica || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;