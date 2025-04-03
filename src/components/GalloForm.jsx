// src/components/GalloForm.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const GalloForm = ({ initialData = {}, lineasGeneticas = [], onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    raza: '',
    peso_actual: '',
    estado: 'Activo',
    fecha_nacimiento: '',
    sexo: 'Macho',
    id_linea: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  
  // Actualizar formData cuando cambia initialData (para edición)
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: '',
        raza: '',
        peso_actual: '',
        estado: 'Activo',
        fecha_nacimiento: '',
        sexo: 'Macho',
        id_linea: '',
        ...initialData
      });
    }
  }, [initialData]);
  
  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error para este campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre || formData.nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.raza || formData.raza.trim() === '') {
      newErrors.raza = 'La raza es obligatoria';
    }
    
    if (formData.peso_actual && isNaN(formData.peso_actual)) {
      newErrors.peso_actual = 'El peso debe ser un número';
    }
    
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convertir peso a número
      const formattedData = {
        ...formData,
        peso_actual: formData.peso_actual ? parseFloat(formData.peso_actual) : null
      };
      
      onSubmit(formattedData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Editar Gallo' : 'Agregar Nuevo Gallo'}
        </h2>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
          onClick={onCancel}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre*
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.nombre 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="Nombre del gallo"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>
          
          {/* Raza */}
          <div>
            <label htmlFor="raza" className="block text-sm font-medium text-gray-700">
              Raza*
            </label>
            <input
              type="text"
              name="raza"
              id="raza"
              value={formData.raza}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.raza 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="Raza del gallo"
            />
            {errors.raza && (
              <p className="mt-1 text-sm text-red-600">{errors.raza}</p>
            )}
          </div>
          
          {/* Peso actual */}
          <div>
            <label htmlFor="peso_actual" className="block text-sm font-medium text-gray-700">
              Peso Actual (g)
            </label>
            <input
              type="text"
              name="peso_actual"
              id="peso_actual"
              value={formData.peso_actual}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.peso_actual 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="Peso en gramos"
            />
            {errors.peso_actual && (
              <p className="mt-1 text-sm text-red-600">{errors.peso_actual}</p>
            )}
          </div>
          
          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="estado"
              id="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Lesionado">Lesionado</option>
              <option value="Retirado">Retirado</option>
            </select>
          </div>
          
          {/* Fecha de nacimiento */}
          <div>
            <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">
              Fecha de Nacimiento*
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              id="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.fecha_nacimiento 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.fecha_nacimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>
            )}
          </div>
          
          {/* Sexo */}
          <div>
            <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
              Sexo
            </label>
            <select
              name="sexo"
              id="sexo"
              value={formData.sexo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
          
          {/* Línea genética */}
          <div>
            <label htmlFor="id_linea" className="block text-sm font-medium text-gray-700">
              Línea Genética
            </label>
            <select
              name="id_linea"
              id="id_linea"
              value={formData.id_linea}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Seleccione una línea genética</option>
              {lineasGeneticas.map((linea) => (
                <option key={linea.id_linea} value={linea.id_linea}>
                  {linea.nombre_linea}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Botones */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isEditing ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalloForm;