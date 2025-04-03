import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

const AddRecordModal = ({ activeTab, gallo, onClose }) => {
  const { updateData, showNotification } = useData();
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData || Object.keys(formData).length === 0) {
      showNotification('Por favor, complete los campos requeridos', 'error');
      return;
    }

    // Preparar los datos según el tipo de registro
    const newData = {
      id: Date.now().toString(),
      id_gallo: gallo.id_gallo,
      fecha: new Date().toISOString().split('T')[0],
      ...formData
    };

    // Determinar la entidad a actualizar según la pestaña activa
    const entityMap = {
      peleas: 'Peleas',
      cuidados: 'Cuidados_Medicos',
      entrenamientos: 'Entrenamientos',
      alimentacion: 'Alimentacion',
      higiene: 'Higiene'
    };

    const entity = entityMap[activeTab];
    if (!entity) {
      showNotification('Tipo de registro no válido', 'error');
      return;
    }

    // Actualizar los datos
    updateData(entity, (prevData) => [...prevData, newData]);
    showNotification('Registro añadido correctamente');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Agregar Nuevo Registro</h3>
        <form onSubmit={handleSubmit}>
          {/* Form fields based on activeTab */}
          {activeTab === 'peleas' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                name="fecha"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          {activeTab === 'cuidados' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <input
                type="text"
                name="tipo"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          {activeTab === 'entrenamientos' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
              <input
                type="number"
                name="duracion"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;