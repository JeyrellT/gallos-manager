import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { Utensils, Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';

const AlimentacionList = ({ searchTerm }) => {
  const { alimentacion = [], gallos, updateData, showNotification } = useData();
  const [filteredAlimentacion, setFilteredAlimentacion] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'descending' });
  const [formData, setFormData] = useState({
    selectedGalloIds: [],
    tipo_alimento: '',
    cantidad_g: '',
    fecha: '',
    observaciones: '',
  });

  const handleGalloSelectionChange = (id) => {
    setFormData((prev) => {
      const selectedGalloIds = prev.selectedGalloIds.includes(id)
        ? prev.selectedGalloIds.filter((galloId) => galloId !== id)
        : [...prev.selectedGalloIds, id];
      return { ...prev, selectedGalloIds };
    });
  };

  // Memorizar la función getGalloNombre para evitar re-renderizados innecesarios
  const getGalloNombre = useCallback((idGallo) => {
    const gallo = gallos.find(g => g.id_gallo === idGallo);
    return gallo ? gallo.nombre : 'Desconocido';
  }, [gallos]);

  // --- Lógica de Ordenamiento ---
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredAlimentacion];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Manejar fechas
        if (sortConfig.key === 'fecha') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        // Manejar nombres de gallo
        else if (sortConfig.key === 'id_gallo') {
             aValue = getGalloNombre(aValue)?.toLowerCase() || '';
             bValue = getGalloNombre(bValue)?.toLowerCase() || '';
        }
         // Manejar números
        else if (typeof aValue === 'number' && typeof bValue === 'number') {
           // ya son números
        }
         // Convertir a string minúscula para otros casos
        else {
           aValue = String(aValue).toLowerCase();
           bValue = String(bValue).toLowerCase();
        }


        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredAlimentacion, sortConfig, getGalloNombre]);
  // --- Fin Lógica de Ordenamiento ---

  // Filtrar y ordenar registros
  useEffect(() => {
    let items = [...alimentacion]; // Copia para no mutar el estado original

    if (searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase();
        items = items.filter(
          item =>
            (item.tipo_alimento && item.tipo_alimento.toLowerCase().includes(normalizedTerm)) ||
            (item.cantidad_g && item.cantidad_g.toString().includes(normalizedTerm)) ||
            (item.fecha && item.fecha.includes(normalizedTerm)) ||
            (item.observaciones && item.observaciones.toLowerCase().includes(normalizedTerm)) ||
            (gallos.find(g => g.id_gallo === item.id_gallo)?.nombre.toLowerCase().includes(normalizedTerm))
        );
    }

    setFilteredAlimentacion(items); // Actualiza el estado filtrado que usa el Memo de ordenamiento

  }, [alimentacion, gallos, searchTerm]); // Dependencias del efecto

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.selectedGalloIds || formData.selectedGalloIds.length === 0) {
      showNotification('Seleccione al menos un gallo', 'error');
      return false;
    }
    if (!formData.tipo_alimento.trim()) {
      showNotification('El tipo de alimento es obligatorio', 'error');
      return false;
    }
    if (!formData.cantidad_g || isNaN(parseFloat(formData.cantidad_g)) || parseFloat(formData.cantidad_g) <= 0) {
      showNotification('La cantidad (g) debe ser un número positivo', 'error');
      return false;
    }
    if (!formData.fecha) {
      showNotification('La fecha es obligatoria', 'error');
      return false;
    }
    return true;
  };

  const handleAddAlimentacion = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newRecords = formData.selectedGalloIds.map((id) => ({
      id_alimentacion: Date.now().toString() + id, // Unique ID per gallo
      id_gallo: id,
      tipo_alimento: formData.tipo_alimento,
      cantidad_g: parseFloat(formData.cantidad_g),
      fecha: formData.fecha,
      observaciones: formData.observaciones,
    }));

    updateData('Alimentacion', [...alimentacion, ...newRecords]);
    setFormData({ selectedGalloIds: [], tipo_alimento: '', cantidad_g: '', fecha: '', observaciones: '' });
    setShowAddForm(false);
    showNotification(`${newRecords.length} registros de alimentación agregados`);
  };

  const handleDeleteAlimentacion = (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro de alimentación?')) return;
    const updatedAlimentacion = alimentacion.filter(item => item.id_alimentacion !== id);
    updateData('Alimentacion', updatedAlimentacion);
    showNotification('Registro de alimentación eliminado');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Intl.DateTimeFormat es más flexible para formatos locales
    try {
        return new Intl.DateTimeFormat('es-CR', { // Usando formato de Costa Rica
            year: 'numeric', month: 'short', day: 'numeric'
        }).format(new Date(dateString + 'T00:00:00')); // Añadir T00:00:00 para evitar problemas de zona horaria
    } catch (e) {
        return 'Fecha inválida';
    }
  };

    // --- Helper para cabeceras de tabla con ordenamiento ---
    const renderSortIcon = (columnKey) => {
      if (sortConfig.key !== columnKey) {
        return <ChevronDown size={14} className="inline-block ml-1 opacity-40" />;
      }
      return sortConfig.direction === 'ascending' ?
        <ChevronUp size={14} className="inline-block ml-1" /> :
        <ChevronDown size={14} className="inline-block ml-1" />;
    };

    const SortableHeader = ({ columnKey, children }) => (
      <th
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        onClick={() => requestSort(columnKey)}
      >
        {children} {renderSortIcon(columnKey)}
      </th>
    );
    // --- Fin Helper ---

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Utensils className="mr-2 text-orange-500" size={24} />
          Alimentación
        </h1>
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? 'Cancelar' : 'Registrar Alimento'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-indigo-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nuevo Registro de Alimentación</h2>
          <form onSubmit={handleAddAlimentacion}>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div className="md:col-span-3">
                 <label className="block text-sm font-medium text-gray-700">Gallos*</label>
                 <div className="mt-2 space-y-2">
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
                 <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha*</label>
                 <input type="date" name="fecha" id="fecha" value={formData.fecha} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div>
                 <label htmlFor="tipo_alimento" className="block text-sm font-medium text-gray-700">Tipo de Alimento*</label>
                 <input type="text" name="tipo_alimento" id="tipo_alimento" value={formData.tipo_alimento} onChange={handleInputChange} required placeholder="Ej: Maíz, Concentrado, Vitaminas" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div>
                 <label htmlFor="cantidad_g" className="block text-sm font-medium text-gray-700">Cantidad (g)*</label>
                 <input type="number" name="cantidad_g" id="cantidad_g" value={formData.cantidad_g} onChange={handleInputChange} required placeholder="Ej: 150" min="0" step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div className="md:col-span-2 lg:col-span-1">
                 <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
                 <textarea name="observaciones" id="observaciones" rows="1" value={formData.observaciones} onChange={handleInputChange} placeholder="Notas adicionales" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
               </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cerrar</button>
              <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Guardar Registro</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {alimentacion.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader columnKey="fecha">Fecha</SortableHeader>
                  <SortableHeader columnKey="id_gallo">Gallo</SortableHeader>
                  <SortableHeader columnKey="tipo_alimento">Tipo Alimento</SortableHeader>
                  <SortableHeader columnKey="cantidad_g">Cantidad (g)</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item) => (
                  <tr key={item.id_alimentacion} className="hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.fecha)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getGalloNombre(item.id_gallo)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tipo_alimento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.cantidad_g}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.observaciones}>{item.observaciones || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex space-x-2">
                         {/* Podrías añadir un botón para editar si implementas esa funcionalidad */}
                         <button onClick={() => handleDeleteAlimentacion(item.id_alimentacion)} className="text-red-500 hover:text-red-700 transition-colors duration-150" title="Eliminar">
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
            {searchTerm ? 'No se encontraron registros de alimentación con ese término.' : 'No hay registros de alimentación. Agregue uno para comenzar.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlimentacionList;