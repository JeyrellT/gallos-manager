import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Scale, Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, X, Edit2 } from 'lucide-react';

const ControlPesosList = ({ searchTerm }) => {
  const { controlPesos = [], gallos, updateData, showNotification } = useData();
  const [filteredPesos, setFilteredPesos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'descending' });
  const [editingPeso, setEditingPeso] = useState(null);
  const [formData, setFormData] = useState({
    id_gallo: '',
    peso_g: '',
    fecha: '',
    notas: ''
  });

  // --- Lógica de Ordenamiento y Cálculo de Diferencia ---
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getGalloNombre = React.useCallback((idGallo) => {
    const gallo = gallos.find(g => g.id_gallo === idGallo);
    return gallo ? gallo.nombre : 'Desconocido';
  }, [gallos]);

  // Calcular pesos anteriores para mostrar diferencia
  const pesosConDiferencia = React.useMemo(() => {
    const pesosPorGallo = {};
    // Agrupar pesos por gallo y ordenar por fecha DESC
    controlPesos.forEach(p => {
        if (!pesosPorGallo[p.id_gallo]) pesosPorGallo[p.id_gallo] = [];
        pesosPorGallo[p.id_gallo].push(p);
    });
    Object.values(pesosPorGallo).forEach(pesos => pesos.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)));

    // Calcular diferencia
    return controlPesos.map(pesoActual => {
        const pesosAnteriores = pesosPorGallo[pesoActual.id_gallo] || [];
        const indexActual = pesosAnteriores.findIndex(p => p.id_control === pesoActual.id_control);
        const pesoAnterior = pesosAnteriores[indexActual + 1]; // El siguiente en la lista ordenada DESC es el anterior cronológicamente
        const diferencia = pesoAnterior ? pesoActual.peso_g - pesoAnterior.peso_g : null;
        return { ...pesoActual, diferencia };
    });
  }, [controlPesos]); // Dependencia de los pesos originales

  const sortedData = React.useMemo(() => {
    // Usar pesosConDiferencia para ordenar
    let sortableItems = [...filteredPesos].map(fp => pesosConDiferencia.find(pcd => pcd.id_control === fp.id_control) || fp);

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
        } else if (typeof aValue === 'number' && typeof bValue === 'number'){
          // ya son números
        }
         else {
           aValue = String(aValue).toLowerCase();
           bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPesos, sortConfig, pesosConDiferencia, getGalloNombre]); // Dependencia del estado filtrado y config ordenamiento
  // --- Fin Lógica de Ordenamiento y Diferencia ---


  useEffect(() => {
     let items = [...controlPesos]; // Usar pesos originales para filtrar

    if (searchTerm) {
      const normalizedTerm = searchTerm.toLowerCase();
      items = items.filter(
        item =>
          (item.fecha && item.fecha.includes(normalizedTerm)) ||
          (item.peso_g && item.peso_g.toString().includes(normalizedTerm)) ||
          (item.notas && item.notas.toLowerCase().includes(normalizedTerm)) ||
          (gallos.find(g => g.id_gallo === item.id_gallo)?.nombre.toLowerCase().includes(normalizedTerm))
      );
    }
    setFilteredPesos(items); // Actualizar estado filtrado
  }, [controlPesos, gallos, searchTerm]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.id_gallo) { showNotification('Seleccione un gallo', 'error'); return false; }
    if (!formData.peso_g || isNaN(parseFloat(formData.peso_g)) || parseFloat(formData.peso_g) <= 0) {
      showNotification('El peso (g) debe ser un número positivo', 'error');
      return false;
    }
    if (!formData.fecha) { showNotification('La fecha es obligatoria', 'error'); return false; }
    return true;
  };

  const handleEditClick = (item) => {
    setEditingPeso(item);
    setFormData({
      id_gallo: item.id_gallo,
      peso_g: item.peso_g.toString(),
      fecha: item.fecha,
      notas: item.notas || ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const peso_g = parseFloat(formData.peso_g);

    if (editingPeso) {
      // Modo edición
      const updatedPesos = controlPesos.map(peso =>
        peso.id_control === editingPeso.id_control
          ? { ...peso, ...formData, peso_g }
          : peso
      );

      updateData('Control_Pesos', updatedPesos);

      // Actualizar peso_actual en el gallo si es el registro más reciente
      const galloRegistros = updatedPesos
        .filter(p => p.id_gallo === formData.id_gallo)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (galloRegistros[0]?.id_control === editingPeso.id_control) {
        const updatedGallos = gallos.map(gallo =>
          gallo.id_gallo === formData.id_gallo
            ? { ...gallo, peso_actual: peso_g }
            : gallo
        );
        updateData('Gallo', updatedGallos);
      }

      showNotification('Registro de peso actualizado correctamente');
    } else {
      // Modo creación
      const newRecord = {
        id_control: Date.now().toString(),
        ...formData,
        peso_g
      };

      const updatedPesos = [...controlPesos, newRecord];
      updateData('Control_Pesos', updatedPesos);

      // Actualizar peso_actual en el gallo
      const updatedGallos = gallos.map(gallo =>
        gallo.id_gallo === formData.id_gallo
          ? { ...gallo, peso_actual: peso_g }
          : gallo
      );
      updateData('Gallo', updatedGallos);

      showNotification('Registro de peso agregado');
    }

    setFormData({ id_gallo: '', peso_g: '', fecha: '', notas: '' });
    setShowAddForm(false);
    setEditingPeso(null);
  };

  const handleDeletePeso = (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro de peso?')) return;
    const updatedPesos = controlPesos.filter(item => item.id_control !== id);
    updateData('Control_Pesos', updatedPesos);
    showNotification('Registro de peso eliminado');
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

  const formatDifference = (diff) => {
      if (diff === null || diff === undefined || isNaN(diff)) return <Minus size={14} className="inline-block text-gray-400" />;
      if (diff > 0) return <span className="text-green-600"><TrendingUp size={14} className="inline-block mr-1"/>+{diff.toFixed(1)}g</span>;
      if (diff < 0) return <span className="text-red-600"><TrendingDown size={14} className="inline-block mr-1"/>{diff.toFixed(1)}g</span>;
      return <Minus size={14} className="inline-block text-gray-500"/>;
  }

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
          <Scale className="mr-2 text-lime-500" size={24} />
          Control de Pesos
        </h1>
        <button
           className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
           onClick={() => {
             if (showAddForm) {
               setFormData({ id_gallo: '', peso_g: '', fecha: '', notas: '' });
               setEditingPeso(null);
             }
             setShowAddForm(!showAddForm);
           }}
        >
           {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
           {showAddForm ? 'Cancelar' : 'Registrar Peso'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-indigo-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingPeso ? 'Editar Registro de Peso' : 'Nuevo Registro de Peso'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label htmlFor="id_gallo" className="block text-sm font-medium text-gray-700">Gallo*</label>
                 <select name="id_gallo" id="id_gallo" value={formData.id_gallo} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                   <option value="">Seleccione un gallo</option>
                   {gallos.sort((a,b) => a.nombre.localeCompare(b.nombre)).map((gallo) => (
                     <option key={gallo.id_gallo} value={gallo.id_gallo}>{gallo.nombre} ({gallo.raza})</option>
                   ))}
                 </select>
               </div>
               <div>
                 <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha*</label>
                 <input type="date" name="fecha" id="fecha" value={formData.fecha} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div>
                 <label htmlFor="peso_g" className="block text-sm font-medium text-gray-700">Peso (g)*</label>
                 <input type="number" name="peso_g" id="peso_g" value={formData.peso_g} onChange={handleInputChange} required placeholder="Ej: 2500" min="0" step="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
               </div>
               <div className="md:col-span-3">
                  <label htmlFor="notas" className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea name="notas" id="notas" rows="2" value={formData.notas} onChange={handleInputChange} placeholder="Condición, motivo del pesaje, etc." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
               </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
               <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cerrar</button>
               <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                 {editingPeso ? 'Actualizar Peso' : 'Guardar Peso'}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
         {controlPesos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader columnKey="fecha">Fecha</SortableHeader>
                  <SortableHeader columnKey="id_gallo">Gallo</SortableHeader>
                  <SortableHeader columnKey="peso_g">Peso (g)</SortableHeader>
                  <SortableHeader columnKey="diferencia">Dif. Anterior</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {sortedData.map((item) => (
                  <tr key={item.id_control} className="hover:bg-indigo-50 transition-colors duration-150">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.fecha)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getGalloNombre(item.id_gallo)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-semibold">{item.peso_g}g</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatDifference(item.diferencia)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.notas}>{item.notas || '-'}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex space-x-2">
                         <button 
                           onClick={() => handleEditClick(item)} 
                           className="text-blue-500 hover:text-blue-700 transition-colors duration-150" 
                           title="Editar"
                         >
                           <Edit2 size={18} />
                         </button>
                         <button onClick={() => handleDeletePeso(item.id_control)} className="text-red-500 hover:text-red-700 transition-colors duration-150" title="Eliminar">
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
             {searchTerm ? 'No se encontraron registros de pesos con ese término.' : 'No hay registros de pesos. Agregue uno para comenzar.'}
          </div>
         )}
      </div>
    </div>
  );
};

export default ControlPesosList;