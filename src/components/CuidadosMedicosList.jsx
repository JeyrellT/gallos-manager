// src/components/CuidadosMedicosList.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Heart, Plus, Trash2, Eye, X, Edit2 } from 'lucide-react';

const CuidadosMedicosList = ({ searchTerm, setActiveTab, onSelectGallo }) => {
  const { cuidadosMedicos, gallos, updateData, showNotification } = useData();
  const [filteredCuidados, setFilteredCuidados] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCuidado, setEditingCuidado] = useState(null);
  const [formData, setFormData] = useState({
    id_gallo: '',
    tipo: '',
    descripcion: '',
    fecha: ''
  });

  // Filtrar cuidados médicos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      // Ordenar por fecha descendente (más reciente primero)
      const sortedCuidados = [...cuidadosMedicos].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      setFilteredCuidados(sortedCuidados);
      return;
    }
    
    const normalizedTerm = searchTerm.toLowerCase();
    
    // Buscar en gallos primero para obtener coincidencias por nombre
    const gallosMatched = gallos.filter(gallo => 
      gallo.nombre.toLowerCase().includes(normalizedTerm)
    );
    const galloIds = gallosMatched.map(g => g.id_gallo);
    
    // Filtrar cuidados que coincidan con el término o con los gallos encontrados
    const filtered = cuidadosMedicos.filter(
      cuidado => 
        (cuidado.tipo && cuidado.tipo.toLowerCase().includes(normalizedTerm)) ||
        (cuidado.descripcion && cuidado.descripcion.toLowerCase().includes(normalizedTerm)) ||
        (cuidado.fecha && cuidado.fecha.includes(normalizedTerm)) ||
        galloIds.includes(cuidado.id_gallo)
    );
    
    // Ordenar por fecha descendente
    const sortedFiltered = [...filtered].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    
    setFilteredCuidados(sortedFiltered);
  }, [cuidadosMedicos, gallos, searchTerm]);
  
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
    
    if (!formData.tipo) {
      errors.push('El tipo de cuidado médico es obligatorio');
    }
    
    if (!formData.fecha) {
      errors.push('La fecha es obligatoria');
    }
    
    if (!formData.descripcion || formData.descripcion.trim() === '') {
      errors.push('La descripción es obligatoria');
    }
    
    if (errors.length > 0) {
      showNotification(errors[0], 'error');
      return false;
    }
    
    return true;
  };
  
  // Agregar nuevo cuidado médico
  const handleAddCuidado = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newId = Date.now().toString();
    const newCuidado = {
      id_cuidado: newId,
      ...formData
    };
    
    const updatedCuidados = [...cuidadosMedicos, newCuidado];
    updateData('Cuidados_Medicos', updatedCuidados);
    
    // Resetear formulario
    setFormData({
      id_gallo: '',
      tipo: '',
      descripcion: '',
      fecha: ''
    });
    setShowAddForm(false);
    showNotification('Cuidado médico registrado correctamente');
  };
  
  // Eliminar cuidado médico
  const handleDeleteCuidado = (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro de cuidado médico?')) {
      return;
    }
    
    const updatedCuidados = cuidadosMedicos.filter(cuidado => cuidado.id_cuidado !== id);
    updateData('Cuidados_Medicos', updatedCuidados);
    showNotification('Cuidado médico eliminado correctamente');
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

  const handleEditClick = (cuidado) => {
    setEditingCuidado(cuidado);
    setFormData({
      id_gallo: cuidado.id_gallo,
      tipo: cuidado.tipo,
      descripcion: cuidado.descripcion,
      fecha: cuidado.fecha
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (editingCuidado) {
      // Modo edición
      const updatedCuidados = cuidadosMedicos.map(cuidado =>
        cuidado.id_cuidado === editingCuidado.id_cuidado
          ? { ...cuidado, ...formData }
          : cuidado
      );
      
      updateData('Cuidados_Medicos', updatedCuidados);
      showNotification('Cuidado médico actualizado correctamente');
    } else {
      // Modo creación
      const newId = Date.now().toString();
      const newCuidado = {
        id_cuidado: newId,
        ...formData
      };
      
      const updatedCuidados = [...cuidadosMedicos, newCuidado];
      updateData('Cuidados_Medicos', updatedCuidados);
      showNotification('Cuidado médico registrado correctamente');
    }
    
    // Resetear formulario
    setFormData({
      id_gallo: '',
      tipo: '',
      descripcion: '',
      fecha: ''
    });
    setShowAddForm(false);
    setEditingCuidado(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Heart className="mr-2 text-red-500" size={24} />
          Cuidados Médicos
        </h1>
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          onClick={() => {
            if (showAddForm) {
              setFormData({ id_gallo: '', tipo: '', descripcion: '', fecha: '' });
              setEditingCuidado(null);
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? 'Cancelar' : 'Registrar Cuidado Médico'}
        </button>
      </div>
      
      {/* Formulario para agregar/editar */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingCuidado ? 'Editar Cuidado Médico' : 'Registrar Nuevo Cuidado Médico'}
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
                      {gallo.nombre} ({gallo.raza})
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
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo de Cuidado*
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
                  <option value="Vacuna">Vacuna</option>
                  <option value="Revisión">Revisión</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Desparasitación">Desparasitación</option>
                  <option value="Vitaminas">Vitaminas</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción*
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describa el cuidado médico aplicado"
                  required
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
                {editingCuidado ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de cuidados médicos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredCuidados.length > 0 ? (
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
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCuidados.map((cuidado) => (
                  <tr key={cuidado.id_cuidado} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(cuidado.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getGalloNombre(cuidado.id_gallo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cuidado.tipo === 'Vacuna' 
                          ? 'bg-green-100 text-green-800' 
                          : cuidado.tipo === 'Tratamiento'
                          ? 'bg-yellow-100 text-yellow-800'
                          : cuidado.tipo === 'Cirugía'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cuidado.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{cuidado.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditClick(cuidado)}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            const gallo = gallos.find(g => g.id_gallo === cuidado.id_gallo);
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
                          onClick={() => handleDeleteCuidado(cuidado.id_cuidado)}
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
            No se encontraron registros de cuidados médicos. {!searchTerm && 'Agregue uno para comenzar.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CuidadosMedicosList;