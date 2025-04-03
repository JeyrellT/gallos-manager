// src/components/PeleasList.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Award, Plus, Trash2, Eye, X, Edit2 } from 'lucide-react';

const PeleasList = ({ searchTerm, setActiveTab, onSelectGallo }) => {
  const { peleas, gallos, updateData, showNotification } = useData();
  const [filteredPeleas, setFilteredPeleas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPelea, setEditingPelea] = useState(null);
  const [formData, setFormData] = useState({
    id_gallo: '',
    fecha: '',
    resultado: 'Victoria',
    duracion_min: '',
    peso_antes: '',
    peso_despues: '',
    observaciones: ''
  });
  
  // Filtrar peleas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      // Ordenar por fecha descendente (más reciente primero)
      const sortedPeleas = [...peleas].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      setFilteredPeleas(sortedPeleas);
      return;
    }
    
    const normalizedTerm = searchTerm.toLowerCase();
    
    // Buscar en gallos primero para obtener coincidencias por nombre
    const gallosMatched = gallos.filter(gallo => 
      gallo.nombre.toLowerCase().includes(normalizedTerm)
    );
    const galloIds = gallosMatched.map(g => g.id_gallo);
    
    // Filtrar peleas que coincidan con el término o con los gallos encontrados
    const filtered = peleas.filter(
      pelea => 
        (pelea.resultado && pelea.resultado.toLowerCase().includes(normalizedTerm)) ||
        (pelea.observaciones && pelea.observaciones.toLowerCase().includes(normalizedTerm)) ||
        (pelea.fecha && pelea.fecha.includes(normalizedTerm)) ||
        galloIds.includes(pelea.id_gallo)
    );
    
    // Ordenar por fecha descendente
    const sortedFiltered = [...filtered].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    
    setFilteredPeleas(sortedFiltered);
  }, [peleas, gallos, searchTerm]);
  
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
    const errors = [];
    
    if (!formData.id_gallo) {
      errors.push('Debe seleccionar un gallo');
    }
    
    if (!formData.fecha) {
      errors.push('La fecha es obligatoria');
    }
    
    if (!formData.resultado) {
      errors.push('El resultado es obligatorio');
    }
    
    if (formData.duracion_min && isNaN(parseFloat(formData.duracion_min))) {
      errors.push('La duración debe ser un número válido');
    }
    
    if (formData.peso_antes && isNaN(parseFloat(formData.peso_antes))) {
      errors.push('El peso antes debe ser un número válido');
    }
    
    if (formData.peso_despues && isNaN(parseFloat(formData.peso_despues))) {
      errors.push('El peso después debe ser un número válido');
    }
    
    if (errors.length > 0) {
      showNotification(errors[0], 'error');
      return false;
    }
    
    return true;
  };
  
  // Agregar nueva pelea
  const handleAddPelea = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newId = Date.now().toString();
    const newPelea = {
      id_pelea: newId,
      ...formData,
      duracion_min: formData.duracion_min ? parseFloat(formData.duracion_min) : null,
      peso_antes: formData.peso_antes ? parseFloat(formData.peso_antes) : null,
      peso_despues: formData.peso_despues ? parseFloat(formData.peso_despues) : null
    };
    
    const updatedPeleas = [...peleas, newPelea];
    updateData('Peleas', updatedPeleas);
    
    // Actualizar peso del gallo si se proporcionó el peso después
    if (formData.peso_despues) {
      const updatedGallos = gallos.map(gallo => 
        gallo.id_gallo === formData.id_gallo 
          ? { ...gallo, peso_actual: parseFloat(formData.peso_despues) } 
          : gallo
      );
      updateData('Gallo', updatedGallos);
    }
    
    // Resetear formulario
    setFormData({
      id_gallo: '',
      fecha: '',
      resultado: 'Victoria',
      duracion_min: '',
      peso_antes: '',
      peso_despues: '',
      observaciones: ''
    });
    setShowAddForm(false);
    showNotification('Pelea registrada correctamente');
  };
  
  // Eliminar pelea
  const handleDeletePelea = (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro de pelea?')) {
      return;
    }
    
    const updatedPeleas = peleas.filter(pelea => pelea.id_pelea !== id);
    updateData('Peleas', updatedPeleas);
    showNotification('Pelea eliminada correctamente');
  };
  
  // Obtener nombre del gallo
  const getGalloNombre = (idGallo) => {
    const gallo = gallos.find(g => g.id_gallo === idGallo);
    return gallo ? gallo.nombre : 'Desconocido';
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleEditClick = (pelea) => {
    setEditingPelea(pelea);
    setFormData({
      id_gallo: pelea.id_gallo,
      fecha: pelea.fecha,
      resultado: pelea.resultado,
      duracion_min: pelea.duracion_min?.toString() || '',
      peso_antes: pelea.peso_antes?.toString() || '',
      peso_despues: pelea.peso_despues?.toString() || '',
      observaciones: pelea.observaciones || ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const numericalFields = {
      duracion_min: formData.duracion_min ? parseFloat(formData.duracion_min) : null,
      peso_antes: formData.peso_antes ? parseFloat(formData.peso_antes) : null,
      peso_despues: formData.peso_despues ? parseFloat(formData.peso_despues) : null
    };
    
    if (editingPelea) {
      // Modo edición
      const updatedPeleas = peleas.map(pelea =>
        pelea.id_pelea === editingPelea.id_pelea
          ? { 
              ...pelea, 
              ...formData,
              ...numericalFields
            }
          : pelea
      );
      
      updateData('Peleas', updatedPeleas);

      // Actualizar peso del gallo si se cambió el peso después
      if (formData.peso_despues) {
        const updatedGallos = gallos.map(gallo => 
          gallo.id_gallo === formData.id_gallo 
            ? { ...gallo, peso_actual: parseFloat(formData.peso_despues) } 
            : gallo
        );
        updateData('Gallo', updatedGallos);
      }
      
      showNotification('Pelea actualizada correctamente');
    } else {
      // Modo creación
      const newPelea = {
        id_pelea: Date.now().toString(),
        ...formData,
        ...numericalFields
      };
      
      updateData('Peleas', [...peleas, newPelea]);
      
      // Actualizar peso del gallo si se proporcionó el peso después
      if (formData.peso_despues) {
        const updatedGallos = gallos.map(gallo => 
          gallo.id_gallo === formData.id_gallo 
            ? { ...gallo, peso_actual: parseFloat(formData.peso_despues) } 
            : gallo
        );
        updateData('Gallo', updatedGallos);
      }
      
      showNotification('Pelea registrada correctamente');
    }
    
    // Resetear formulario
    setFormData({
      id_gallo: '',
      fecha: '',
      resultado: 'Victoria',
      duracion_min: '',
      peso_antes: '',
      peso_despues: '',
      observaciones: ''
    });
    setShowAddForm(false);
    setEditingPelea(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Award className="mr-2 text-indigo-500" size={24} />
          Peleas
        </h1>
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          onClick={() => {
            if (showAddForm) {
              setFormData({
                id_gallo: '',
                fecha: '',
                resultado: 'Victoria',
                duracion_min: '',
                peso_antes: '',
                peso_despues: '',
                observaciones: ''
              });
              setEditingPelea(null);
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? 'Cancelar' : 'Registrar Pelea'}
        </button>
      </div>
      
      {/* Formulario para agregar/editar */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingPelea ? 'Editar Pelea' : 'Registrar Nueva Pelea'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="id_gallo" className="block text-sm font-medium text-gray-700">
                  Gallo*
                </label>
                <select
                  name="id_gallo"
                  id="id_gallo"
                  value={formData.id_gallo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione un gallo</option>
                  {gallos.map((gallo) => (
                    <option key={gallo.id_gallo} value={gallo.id_gallo}>
                      {gallo.nombre} ({gallo.raza}) - {gallo.peso_actual || 'N/A'} g
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                  Fecha*
                </label>
                <input
                  type="date"
                  name="fecha"
                  id="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="resultado" className="block text-sm font-medium text-gray-700">
                  Resultado*
                </label>
                <select
                  name="resultado"
                  id="resultado"
                  value={formData.resultado}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Victoria">Victoria</option>
                  <option value="Derrota">Derrota</option>
                  <option value="Empate">Empate</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="duracion_min" className="block text-sm font-medium text-gray-700">
                  Duración (min)
                </label>
                <input
                  type="number"
                  name="duracion_min"
                  id="duracion_min"
                  value={formData.duracion_min}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="0"
                  step="1"
                />
              </div>
              
              <div>
                <label htmlFor="peso_antes" className="block text-sm font-medium text-gray-700">
                  Peso antes (g)
                </label>
                <input
                  type="number"
                  name="peso_antes"
                  id="peso_antes"
                  value={formData.peso_antes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="0"
                />
              </div>
              
              <div>
                <label htmlFor="peso_despues" className="block text-sm font-medium text-gray-700">
                  Peso después (g)
                </label>
                <input
                  type="number"
                  name="peso_despues"
                  id="peso_despues"
                  value={formData.peso_despues}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="0"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  id="observaciones"
                  rows="3"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingPelea ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de peleas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredPeleas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gallo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso Antes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso Después
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPeleas.map((pelea) => (
                  <tr key={pelea.id_pelea} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(pelea.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getGalloNombre(pelea.id_gallo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pelea.resultado === 'Victoria' 
                          ? 'bg-green-100 text-green-800' 
                          : pelea.resultado === 'Derrota'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pelea.resultado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{pelea.duracion_min ? `${pelea.duracion_min} min` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{pelea.peso_antes ? `${pelea.peso_antes} g` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{pelea.peso_despues ? `${pelea.peso_despues} g` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditClick(pelea)}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            const gallo = gallos.find(g => g.id_gallo === pelea.id_gallo);
                            if (gallo) {
                              setActiveTab('Gallo');
                              onSelectGallo(gallo);
                            }
                          }}
                          title="Ver gallo"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeletePelea(pelea.id_pelea)}
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
            No se encontraron registros de peleas. {!searchTerm && 'Agregue uno para comenzar.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeleasList;