import React from 'react';

const AddRecordModal = ({ activeTab, gallo, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Agregar Nuevo Registro</h3>
        <form>
          {/* Form fields based on activeTab */}
          {activeTab === 'peleas' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          )}
          {activeTab === 'cuidados' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          )}
          {activeTab === 'entrenamientos' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Duración</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          )}
          <div className="mt-4 flex justify-end space-x-3">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded-md" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;