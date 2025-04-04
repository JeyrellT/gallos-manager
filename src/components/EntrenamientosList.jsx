// src/components/EntrenamientosList.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Activity, Plus, Trash2, Eye, X, CalendarClock, Edit2 } from 'lucide-react';
import { parseISO, addDays, addWeeks, addMonths, format, isBefore, addYears } from 'date-fns';

const initialFormData = {
  selectedGalloIds: [],
  tipo: '',
  duracion_min: '',
  intensidad: 'Media',
  fecha: '',
  isRecurrente: false,
  fechaFinal: '',
  frecuencia: 'diario',
};

const EntrenamientosList = ({ searchTerm, setActiveTab, onSelectGallo }) => {
  const { entrenamientos, gallos, updateData, showNotification } = useData();
  const [filteredEntrenamientos, setFilteredEntrenamientos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntrenamiento, setEditingEntrenamiento] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Filtrar entrenamientos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      // Ordenar por fecha descendente (más reciente primero)
      const sortedEntrenamientos = [...entrenamientos].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      setFilteredEntrenamientos(sortedEntrenamientos);
      return;
    }
    
    const normalizedTerm = searchTerm.toLowerCase();
    
    // Buscar en gallos primero para obtener coincidencias por nombre
    const gallosMatched = gallos.filter(gallo => 
      gallo.nombre.toLowerCase().includes(normalizedTerm)
    );
    const galloIds = gallosMatched.map(g => g.id_gallo);
    
    // Filtrar entrenamientos que coincidan con el término o con los gallos encontrados
    const filtered = entrenamientos.filter(
      entrenamiento => 
        (entrenamiento.tipo && entrenamiento.tipo.toLowerCase().includes(normalizedTerm)) ||
        (entrenamiento.intensidad && entrenamiento.intensidad.toLowerCase().includes(normalizedTerm)) ||
        (entrenamiento.fecha && entrenamiento.fecha.includes(normalizedTerm)) ||
        galloIds.includes(entrenamiento.id_gallo)
    );
    
    // Ordenar por fecha descendente
    const sortedFiltered = [...filtered].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    
    setFilteredEntrenamientos(sortedFiltered);
  }, [entrenamientos, gallos, searchTerm]);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGalloSelectionChange = (id) => {
    setFormData((prev) => {
      const selectedGalloIds = prev.selectedGalloIds.includes(id)
        ? prev.selectedGalloIds.filter((galloId) => galloId !== id)
        : [...prev.selectedGalloIds, id];
      return { ...prev, selectedGalloIds };
    });
  };
  
  // Validar formulario
  const validateForm = () => {
    if (!formData.selectedGalloIds || formData.selectedGalloIds.length === 0) {
      showNotification('Seleccione al menos un gallo', 'error');
      return false;
    }
    if (!formData.tipo.trim()) {
      showNotification('El tipo de entrenamiento es obligatorio', 'error');
      return false;
    }
    if (!formData.fecha) {
      showNotification('La fecha es obligatoria', 'error');
      return false;
    }
    if (formData.duracion_min && isNaN(parseFloat(formData.duracion_min))) {
      showNotification('La duración debe ser un número válido', 'error');
      return false;
    }
    
    // Validaciones adicionales si es recurrente
    if (formData.isRecurrente) {
        if (!formData.fechaFinal) { 
          showNotification('La fecha final es obligatoria para tareas recurrentes', 'error'); 
          return false; 
        }
        try {
            const inicio = parseISO(formData.fecha);
            const fin = parseISO(formData.fechaFinal);
            if (isBefore(fin, inicio)) {
                showNotification('La fecha final no puede ser anterior a la fecha de inicio', 'error'); 
                return false;
            }
        } catch (e) {
             showNotification('Formato de fecha inválido.', 'error'); 
             return false;
        }
        if (!formData.frecuencia) { 
          showNotification('Seleccione una frecuencia para la recurrencia', 'error'); 
          return false; 
        }
    }
    
    return true;
  };
  
  // Agregar nuevo entrenamiento
  
  // Eliminar entrenamiento
  const handleDeleteEntrenamiento = (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro de entrenamiento?')) {
      return;
    }
    
    const updatedEntrenamientos = entrenamientos.filter(entrenamiento => entrenamiento.id_entrenamiento !== id);
    updateData('Entrenamientos', updatedEntrenamientos);
    showNotification('Entrenamiento eliminado correctamente');
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

  const handleEditClick = (entrenamiento) => {
    setEditingEntrenamiento(entrenamiento);
    setFormData({
      selectedGalloIds: [entrenamiento.id_gallo],
      tipo: entrenamiento.tipo,
      duracion_min: entrenamiento.duracion_min?.toString() || '',
      intensidad: entrenamiento.intensidad || 'Media',
      fecha: entrenamiento.fecha,
      isRecurrente: false, // Reset recurrence when editing
      fechaFinal: '',
      frecuencia: 'diario',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingEntrenamiento) {
      // Modo edición
      const updatedEntrenamientos = entrenamientos.map(entrenamiento =>
        entrenamiento.id_entrenamiento === editingEntrenamiento.id_entrenamiento
          ? {
              ...entrenamiento,
              id_gallo: formData.selectedGalloIds[0],
              tipo: formData.tipo,
              duracion_min: formData.duracion_min ? parseFloat(formData.duracion_min) : null,
              intensidad: formData.intensidad,
              fecha: formData.fecha,
            }
          : entrenamiento
      );
      
      updateData('Entrenamientos', updatedEntrenamientos);
      showNotification('Entrenamiento actualizado correctamente');
    } else {
      // Modo creación (mantener lógica existente de creación recurrente)
      const batchRecords = [];
      
      for (const galloId of formData.selectedGalloIds) {
        let currentDate = parseISO(formData.fecha);
        const finalDate = formData.isRecurrente ? parseISO(formData.fechaFinal) : currentDate;
        
        if (formData.isRecurrente) {
          // Crear registros recurrentes
          while (isBefore(currentDate, finalDate) || format(currentDate, 'yyyy-MM-dd') === format(finalDate, 'yyyy-MM-dd')) {
            batchRecords.push({
              id_entrenamiento: `${Date.now()}-${galloId}-${format(currentDate, 'yyyyMMdd')}`,
              id_gallo: galloId,
              tipo: formData.tipo,
              duracion_min: formData.duracion_min ? parseFloat(formData.duracion_min) : null,
              intensidad: formData.intensidad,
              fecha: format(currentDate, 'yyyy-MM-dd'),
            });

            // Avanzar fecha según frecuencia
            switch (formData.frecuencia) {
              case 'diario':
                currentDate = addDays(currentDate, 1);
                break;
              case 'semanal':
                currentDate = addWeeks(currentDate, 1);
                break;
              case 'mensual':
                currentDate = addMonths(currentDate, 1);
                break;
              case 'anual':
                currentDate = addYears(currentDate, 1);
                break;
              default:
                currentDate = addDays(currentDate, 1);
            }
          }
        } else {
          // Crear un solo registro normal
          batchRecords.push({
            id_entrenamiento: `${Date.now()}-${galloId}-ent`,
            id_gallo: galloId,
            tipo: formData.tipo,
            duracion_min: formData.duracion_min ? parseFloat(formData.duracion_min) : null,
            intensidad: formData.intensidad,
            fecha: formData.fecha,
          });
        }
      }
      
      updateData('Entrenamientos', [...entrenamientos, ...batchRecords]);
      showNotification(`${batchRecords.length} registro(s) de entrenamiento ${formData.isRecurrente ? 'programados' : 'agregados'}.`);
    }
    
    setFormData(initialFormData);
    setShowAddForm(false);
    setEditingEntrenamiento(null);
  };

  const handleViewGallo = (galloId) => {
    const gallo = gallos.find(g => g.id_gallo === galloId);
    if (gallo) {
      // Solo ejecutar setActiveTab si es una función
      if (typeof setActiveTab === 'function') {
        setActiveTab('Gallo');
      } else {
        console.warn('setActiveTab is not a function. Make sure it is passed as a prop to EntrenamientosList component.');
      }
      
      // Solo ejecutar onSelectGallo si es una función
      if (typeof onSelectGallo === 'function') {
        onSelectGallo(gallo);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Activity className="mr-2 text-green-500" size={24} />
          Entrenamientos
        </h1>
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          onClick={() => {
            if (showAddForm) {
              setFormData(initialFormData);
              setEditingEntrenamiento(null);
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? 'Cancelar' : 'Registrar Entrenamiento'}
        </button>
      </div>
      
      {/* Formulario para agregar/editar */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingEntrenamiento ? 'Editar Entrenamiento' : 'Registrar Nuevo Entrenamiento'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Gallos*</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {gallos.map((gallo) => (
                    <div key={gallo.id_gallo} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`gallo-${gallo.id_gallo}`}
                        checked={formData.selectedGalloIds.includes(gallo.id_gallo)}
                        onChange={() => handleGalloSelectionChange(gallo.id_gallo)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={`gallo-${gallo.id_gallo}`} className="ml-2 text-sm text-gray-700">
                        {gallo.nombre} ({gallo.raza})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                  {formData.isRecurrente ? 'Fecha Inicial*' : 'Fecha*'}
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
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo de Entrenamiento*
                </label>
                <select
                  name="tipo"
                  id="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Carrera">Carrera</option>
                  <option value="Vuelo">Vuelo</option>
                  <option value="Resistencia">Resistencia</option>
                  <option value="Fuerza">Fuerza</option>
                  <option value="Combate">Combate</option>
                  <option value="Estiramientos">Estiramientos</option>
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
                <label htmlFor="intensidad" className="block text-sm font-medium text-gray-700">
                  Intensidad*
                </label>
                <select
                  name="intensidad"
                  id="intensidad"
                  value={formData.intensidad}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>
            
            {!editingEntrenamiento && (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isRecurrente"
                    name="isRecurrente"
                    checked={formData.isRecurrente}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isRecurrente" className="ml-2 block text-sm font-medium text-gray-700 flex items-center">
                    <CalendarClock className="inline-block mr-1 h-4 w-4 text-indigo-500" />
                    Entrenamiento recurrente
                  </label>
                </div>
               
                {formData.isRecurrente && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-indigo-100">
                    <div>
                      <label htmlFor="fechaFinal" className="block text-sm font-medium text-gray-700">
                        Fecha Final*
                      </label>
                      <input
                        type="date"
                        name="fechaFinal"
                        id="fechaFinal"
                        value={formData.fechaFinal}
                        onChange={handleInputChange}
                        min={formData.fecha}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="frecuencia" className="block text-sm font-medium text-gray-700">
                        Frecuencia*
                      </label>
                      <select
                        name="frecuencia"
                        id="frecuencia"
                        value={formData.frecuencia}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="diario">Diario</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
                {editingEntrenamiento ? 'Actualizar' : (formData.isRecurrente 
                  ? `Programar para ${formData.selectedGalloIds.length} Gallo(s)` 
                  : `Guardar para ${formData.selectedGalloIds.length} Gallo(s)`)}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de entrenamientos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredEntrenamientos.length > 0 ? (
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
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intensidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntrenamientos.map((entrenamiento) => (
                  <tr key={entrenamiento.id_entrenamiento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(entrenamiento.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getGalloNombre(entrenamiento.id_gallo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{entrenamiento.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{entrenamiento.duracion_min ? `${entrenamiento.duracion_min} min` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entrenamiento.intensidad === 'Alta' 
                          ? 'bg-red-100 text-red-800' 
                          : entrenamiento.intensidad === 'Media'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entrenamiento.intensidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditClick(entrenamiento)}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleViewGallo(entrenamiento.id_gallo)}
                          title="Ver gallo"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteEntrenamiento(entrenamiento.id_entrenamiento)}
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
            No se encontraron registros de entrenamientos. {!searchTerm && 'Agregue uno para comenzar.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntrenamientosList;