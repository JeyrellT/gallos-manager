import React from 'react';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

const GalloHeader = ({ gallo, onBack, onEdit, onDelete }) => {
  return (
    <div className="flex items-center mb-4">
      <button
        className="mr-2 p-2 rounded-md hover:bg-gray-100"
        onClick={onBack}
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        {gallo.nombre}
      </h1>
      <div className="ml-auto flex space-x-2">
        <button
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          onClick={onEdit}
        >
          <Edit2 className="mr-1 h-4 w-4" /> Editar
        </button>
        <button
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Eliminar
        </button>
      </div>
    </div>
  );
};

export default GalloHeader;