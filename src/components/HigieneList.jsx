import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { SprayCan, Plus, Trash2, ChevronDown, ChevronUp, X, CalendarClock } from 'lucide-react';
import { parseISO, addDays, addWeeks, addMonths, format, isBefore, addYears } from 'date-fns';

const initialFormData = {
  selectedGalloIds: [],
  tipo: '',
  descripcion: '',
  fecha: '', // Funcionará como fecha de inicio
  isRecurrente: false,
  fechaFinal: '',
  frecuencia: 'diario', // O la frecuencia por defecto que prefieras
};

const HigieneList = ({ searchTerm }) => {
  const { higiene = [], gallos, updateData, showNotification } = useData();
  const [filteredHigiene, setFilteredHigiene] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'descending' });
  const [formData, setFormData] = useState(initialFormData);

  const handleGalloSelectionChange = (id) => {
    setFormData((prev) => {
      const selectedGalloIds = prev.selectedGalloIds.includes(id)
        ? prev.selectedGalloIds.filter((galloId) => galloId !== id)
        : [...prev.selectedGalloIds, id];
      return { ...prev, selectedGalloIds };
    });
  };

  const getGalloNombre = useCallback((idGallo) => {
    const gallo = gallos.find(g => g.id_gallo === idGallo);
    return gallo ? gallo.nombre : 'Desconocido';
  }, [gallos]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredHigiene];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'fecha') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (sortConfig.key === 'id_gallo') {
          aValue = getGalloNombre(aValue)?.toLowerCase() || '';
          bValue = getGalloNombre(bValue)?.toLowerCase() || '';
        } else {
           aValue = String(aValue).toLowerCase();
           bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredHigiene, sortConfig, getGalloNombre]);

  useEffect(() => {
     let items = [...higiene];

    if (searchTerm) {
      const normalizedTerm = searchTerm.toLowerCase();
      items = items.filter(
        item =>
          (item.tipo && item.tipo.toLowerCase().includes(normalizedTerm)) ||
          (item.descripcion && item.descripcion.toLowerCase().includes(normalizedTerm)) ||
          (item.fecha && item.fecha.includes(normalizedTerm)) ||
          (gallos.find(g => g.id_gallo === item.id_gallo)?.nombre.toLowerCase().includes(normalizedTerm))
      );
    }
     setFilteredHigiene(items);
  }, [higiene, gallos, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const validateForm = () => {
    if (!formData.selectedGalloIds || formData.selectedGalloIds.length === 0) {
      showNotification('Seleccione al menos un gallo', 'error');
      return false;
    }
    if (!formData.tipo.trim()) {
      showNotification('El tipo de higiene es obligatorio', 'error');
      return false;
    }
    if (!formData.fecha) {
      showNotification('La fecha es obligatoria', 'error');
      return false;
    }
    if (!formData.descripcion.trim()) {
      showNotification('La descripción es obligatoria', 'error');
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

  const handleAddHigiene = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isRecurrente = formData.isRecurrente;
    const batchRecords = [];
    
    for (const galloId of formData.selectedGalloIds) {
      if (isRecurrente) {
        // Crear múltiples registros basados en la recurrencia
        let currentDate = new Date(formData.fecha);
        const endDate = new Date(formData.fechaFinal);
        
        // Necesitamos estos valores para cada registro
        const details = {
          tipo: formData.tipo,
          descripcion: formData.descripcion
        };
        
        while (currentDate <= endDate) {
          const formattedDate = format(currentDate, 'yyyy-MM-dd');
          
          batchRecords.push({
            id_higiene: `${Date.parse(currentDate)}-${galloId}-hig`, // ID único y específico
            id_gallo: galloId,
            fecha: formattedDate,
            tipo: details.tipo,
            descripcion: details.descripcion
          });
          
          // Avanzar a la siguiente fecha según la frecuencia
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
          id_higiene: `${Date.now()}-${galloId}-hig`,
          id_gallo: galloId,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
          fecha: formData.fecha,
        });
      }
    }
    
    const updatedHigiene = [...higiene, ...batchRecords];
    updateData('Higiene', updatedHigiene);
    
    setFormData(initialFormData);
    setShowAddForm(false);
    showNotification(`${batchRecords.length} registro(s) de higiene ${isRecurrente ? 'programados' : 'agregados'}.`);
  };

  const handleDeleteHigiene = (id) => {
     if (!window.confirm('¿Está seguro de eliminar este registro de higiene?')) return;
    const updatedHigiene = higiene.filter(item => item.id_higiene !== id);
    updateData('Higiene', updatedHigiene);
    showNotification('Registro de higiene eliminado');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
     try {
        return new Intl.DateTimeFormat('es-CR', {
            year: 'numeric', month: 'short', day: 'numeric'
        }).format(new Date(dateString + 'T00:00:00'));
    } catch (e) {
        return 'Fecha inválida';
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <SprayCan className="mr-2 text-cyan-500" size={24} />
          Higiene
        </h1>
        <button
           className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
           onClick={() => {
             setShowAddForm(!showAddForm);
             if (!showAddForm) {
               setFormData(initialFormData);
             }
           }}
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? 'Cancelar' : 'Registrar Higiene'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-indigo-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nuevo Registro de Higiene</h2>
          <form onSubmit={handleAddHigiene}>
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
                 <input type="date" name="fecha" id="fecha" value={formData.fecha} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div>
                 <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo*</label>
                 <input type="text" name="tipo" id="tipo" value={formData.tipo} onChange={handleInputChange} required placeholder="Ej: Limpieza jaula, Baño, Desinfección" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div className="md:col-span-2">
                 <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción*</label>
                 <textarea name="descripcion" id="descripcion" rows="3" value={formData.descripcion} onChange={handleInputChange} required placeholder="Detalles de la higiene realizada (productos usados, etc.)" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
               </div>
             </div>
             
             {/* Opciones de recurrencia */}
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
                   Tarea recurrente
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
             
            <div className="mt-6 flex justify-end space-x-3">
               <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cerrar</button>
              <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                {formData.isRecurrente 
                  ? `Programar para ${formData.selectedGalloIds.length} Gallo(s)` 
                  : `Guardar para ${formData.selectedGalloIds.length} Gallo(s)`}
              </button>
            </div>
          </form>
        </div>
      )}

       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
         {higiene.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader columnKey="fecha">Fecha</SortableHeader>
                  <SortableHeader columnKey="id_gallo">Gallo</SortableHeader>
                  <SortableHeader columnKey="tipo">Tipo</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {sortedData.map((item) => (
                  <tr key={item.id_higiene} className="hover:bg-indigo-50 transition-colors duration-150">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.fecha)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getGalloNombre(item.id_gallo)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tipo}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={item.descripcion}>{item.descripcion}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex space-x-2">
                         <button onClick={() => handleDeleteHigiene(item.id_higiene)} className="text-red-500 hover:text-red-700 transition-colors duration-150" title="Eliminar">
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
             {searchTerm ? 'No se encontraron registros de higiene con ese término.' : 'No hay registros de higiene. Agregue uno para comenzar.'}
          </div>
         )}
      </div>
    </div>
  );
};

export default HigieneList;