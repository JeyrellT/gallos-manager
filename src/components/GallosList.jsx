// src/components/GallosList.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Feather, Plus, Trash2, Edit2, Eye } from 'lucide-react';
import GalloForm from './GalloForm';

const GallosList = ({ searchTerm, onSelectGallo }) => {
  const { gallos, lineasGeneticas, updateData, showNotification } = useData();
  const [filteredGallos, setFilteredGallos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGallo, setEditingGallo] = useState(null);
  
  // Filtrar gallos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredGallos(gallos);
      return;
    }
    
    const normalizedTerm = searchTerm.toLowerCase();
    const filtered = gallos.filter(
      gallo => 
        gallo.nombre.toLowerCase().includes(normalizedTerm) ||
        gallo.raza.toLowerCase().includes(normalizedTerm) ||
        (gallo.estado && gallo.estado.toLowerCase().includes(normalizedTerm))
    );
    
    setFilteredGallos(filtered);
  }, [gallos, searchTerm]);
  
  // Agregar un nuevo gallo
  const handleAddGallo = (formData) => {
    const newId = Date.now().toString();
    const newGallo = {
      id_gallo: newId,
      ...formData
    };
    
    const updatedGallos = [...gallos, newGallo];
    updateData('Gallo', updatedGallos);
    setShowAddForm(false);
    showNotification('Gallo agregado correctamente');
  };
  
  // Editar un gallo existente
  const handleEditGallo = (formData) => {
    const updatedGallos = gallos.map(gallo => 
      gallo.id_gallo === editingGallo.id_gallo 
        ? { ...gallo, ...formData } 
        : gallo
    );
    
    updateData('Gallo', updatedGallos);
    setEditingGallo(null);
    showNotification('Gallo actualizado correctamente');
  };
  
  // Eliminar un gallo
  const handleDeleteGallo = (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este gallo?')) {
      return;
    }
    
    const updatedGallos = gallos.filter(gallo => gallo.id_gallo !== id);
    updateData('Gallo', updatedGallos);
    showNotification('Gallo eliminado correctamente');
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  // Obtener el nombre de la línea genética
  const getLineaGeneticaNombre = (idLinea) => {
    if (!idLinea) return 'N/A';
    const linea = lineasGeneticas.find(l => l.id_linea === idLinea);
    return linea ? linea.nombre_linea : 'Desconocida';
  };

  // Renderizar vista de tarjetas para móviles o tabletas pequeñas
  const renderMobileCards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {filteredGallos.map(gallo => (
          <div key={gallo.id_gallo} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">{gallo.nombre}</h3>
              <span className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${
                gallo.estado === 'Activo' 
                  ? 'bg-green-100 text-green-800' 
                  : gallo.estado === 'Lesionado'
                  ? 'bg-red-100 text-red-800'
                  : gallo.estado === 'Retirado'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {gallo.estado || 'Desconocido'}
              </span>
            </div>
            
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Raza:</span>
                <span className="font-medium">{gallo.raza}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Peso:</span>
                <span className="font-medium">{gallo.peso_actual || 'N/A'} g</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Nacimiento:</span>
                <span className="font-medium">{formatDate(gallo.fecha_nacimiento)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Línea:</span>
                <span className="font-medium">{getLineaGeneticaNombre(gallo.id_linea)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center space-x-4">
              <button
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                onClick={() => onSelectGallo(gallo)}
                title="Ver detalles"
              >
                <Eye size={18} />
              </button>
              <button
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                onClick={() => setEditingGallo(gallo)}
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                onClick={() => handleDeleteGallo(gallo.id_gallo)}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Feather className="mr-2 text-indigo-500" size={24} />
          Gallos
        </h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Gallo
        </button>
      </div>
      
      {/* Formulario para agregar/editar */}
      {(showAddForm || editingGallo) && (
        <GalloForm
          initialData={editingGallo || {}}
          lineasGeneticas={lineasGeneticas}
          onSubmit={editingGallo ? handleEditGallo : handleAddGallo}
          onCancel={() => {
            setShowAddForm(false);
            setEditingGallo(null);
          }}
          isEditing={!!editingGallo}
        />
      )}
      
      {/* Mostrar las tarjetas en móvil */}
      {filteredGallos.length > 0 ? (
        <>
          {/* Vista de tarjetas para móvil */}
          {renderMobileCards()}
          
          {/* Tabla para escritorio */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
            <div className="table-responsive">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raza
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Nacimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Línea Genética
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGallos.map((gallo) => (
                    <tr key={gallo.id_gallo} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{gallo.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{gallo.raza}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{gallo.peso_actual || 'N/A'} g</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          gallo.estado === 'Activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {gallo.estado || 'Desconocido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(gallo.fecha_nacimiento)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getLineaGeneticaNombre(gallo.id_linea)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => onSelectGallo(gallo)}
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => setEditingGallo(gallo)}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteGallo(gallo.id_gallo)}
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
          </div>
        </>
      ) : (
        <div className="px-6 py-4 text-center text-gray-500 bg-white rounded-lg shadow-sm">
          No se encontraron gallos. {!searchTerm && 'Agregue uno para comenzar.'}
        </div>
      )}
    </div>
  );
};

export default GallosList;