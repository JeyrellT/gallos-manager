// src/components/LineaGeneticaList.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Activity, Plus, Edit2, Trash2 } from 'lucide-react';

const LineaGeneticaList = ({ searchTerm }) => {
  const { lineasGeneticas, gallos, updateData, showNotification } = useData();
  const [filteredLineas, setFilteredLineas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre_linea: '',
    descripcion: ''
  });
  const [editingLinea, setEditingLinea] = useState(null);
  
  // Filtrar líneas genéticas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLineas(lineasGeneticas);
      return;
    }
    
    const normalizedTerm = searchTerm.toLowerCase();
    const filtered = lineasGeneticas.filter(
      linea => 
        linea.nombre_linea.toLowerCase().includes(normalizedTerm) ||
        (linea.descripcion && linea.descripcion.toLowerCase().includes(normalizedTerm))
    );
    
    setFilteredLineas(filtered);
  }, [lineasGeneticas, searchTerm]);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Validar formulario
  const validateForm = () => {
    if (!formData.nombre_linea || formData.nombre_linea.trim() === '') {
      showNotification('El nombre de la línea es obligatorio', 'error');
      return false;
    }
    return true;
  };
  
  // Agregar nueva línea genética
  const handleAddLinea = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newId = Date.now().toString();
    const newLinea = {
      id_linea: newId,
      ...formData
    };
    
    const updatedLineas = [...lineasGeneticas, newLinea];
    updateData('Linea_Genetica', updatedLineas);
    
    // Resetear formulario
    setFormData({
      nombre_linea: '',
      descripcion: ''
    });
    setShowAddForm(false);
    showNotification('Línea genética agregada correctamente');
  };
  
  // Actualizar línea genética
  const handleUpdateLinea = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updatedLineas = lineasGeneticas.map(linea => 
      linea.id_linea === editingLinea.id_linea 
        ? { ...linea, ...formData } 
        : linea
    );
    
    updateData('Linea_Genetica', updatedLineas);
    
    // Resetear formulario
    setFormData({
      nombre_linea: '',
      descripcion: ''
    });
    setEditingLinea(null);
    showNotification('Línea genética actualizada correctamente');
  };
  
  // Eliminar línea genética
  const handleDeleteLinea = (id) => {
    // Verificar si la línea genética está asociada a algún gallo
    const lineasUsadas = gallos.some(gallo => gallo.id_linea === id);
    
    if (lineasUsadas) {
      showNotification('No se puede eliminar la línea genética porque está asociada a uno o más gallos', 'error');
      return;
    }
    
    if (!window.confirm('¿Está seguro de que desea eliminar esta línea genética?')) {
      return;
    }
    
    const updatedLineas = lineasGeneticas.filter(linea => linea.id_linea !== id);
    updateData('Linea_Genetica', updatedLineas);
    showNotification('Línea genética eliminada correctamente');
  };
  
  // Iniciar edición de línea genética
  const handleEditLinea = (linea) => {
    setFormData({
      nombre_linea: linea.nombre_linea,
      descripcion: linea.descripcion || ''
    });
    setEditingLinea(linea);
    setShowAddForm(false);
  };
  
  // Cancelar formulario
  const handleCancelForm = () => {
    setFormData({
      nombre_linea: '',
      descripcion: ''
    });
    setEditingLinea(null);
    setShowAddForm(false);
  };
  
  // Contar gallos por línea genética
  const countGallosByLinea = (idLinea) => {
    return gallos.filter(gallo => gallo.id_linea === idLinea).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Activity className="mr-2 text-indigo-500" size={24} />
          Líneas Genéticas
        </h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingLinea(null);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Línea Genética
        </button>
      </div>
      
      {/* Formulario para agregar/editar */}
      {(showAddForm || editingLinea) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingLinea ? 'Editar Línea Genética' : 'Agregar Nueva Línea Genética'}
          </h2>
          
          <form onSubmit={editingLinea ? handleUpdateLinea : handleAddLinea}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="nombre_linea" className="block text-sm font-medium text-gray-700">
                  Nombre de la Línea*
                </label>
                <input
                  type="text"
                  name="nombre_linea"
                  id="nombre_linea"
                  value={formData.nombre_linea}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Nombre de la línea genética"
                />
              </div>
              
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describa las características de la línea genética"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleCancelForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingLinea ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de líneas genéticas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredLineas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gallos Asociados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLineas.map((linea) => (
                  <tr key={linea.id_linea} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{linea.nombre_linea}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{linea.descripcion || 'Sin descripción'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {countGallosByLinea(linea.id_linea)} gallos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditLinea(linea)}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteLinea(linea.id_linea)}
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No se encontraron líneas genéticas. {!searchTerm && 'Agregue una para comenzar.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LineaGeneticaList;