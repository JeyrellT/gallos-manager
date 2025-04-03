// src/utils/validators.js

/**
 * Biblioteca de funciones para validar datos en la aplicación
 */

/**
 * Valida que un objeto gallo tenga todos los campos requeridos
 * @param {Object} gallo - Objeto con datos del gallo a validar
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateGallo = (gallo) => {
    const errors = [];
  
    if (!gallo.nombre || gallo.nombre.trim() === '') {
      errors.push('El nombre es obligatorio');
    }
  
    if (!gallo.raza || gallo.raza.trim() === '') {
      errors.push('La raza es obligatoria');
    }
  
    if (gallo.peso_actual && isNaN(parseFloat(gallo.peso_actual))) {
      errors.push('El peso debe ser un número válido');
    }
  
    if (!gallo.fecha_nacimiento) {
      errors.push('La fecha de nacimiento es obligatoria');
    } else if (!isValidDate(gallo.fecha_nacimiento)) {
      errors.push('La fecha de nacimiento no es válida');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Valida que un objeto línea genética tenga todos los campos requeridos
   * @param {Object} linea - Objeto con datos de la línea genética
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  export const validateLineaGenetica = (linea) => {
    const errors = [];
  
    if (!linea.nombre_linea || linea.nombre_linea.trim() === '') {
      errors.push('El nombre de la línea es obligatorio');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Valida que un objeto pelea tenga todos los campos requeridos
   * @param {Object} pelea - Objeto con datos de la pelea
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  export const validatePelea = (pelea) => {
    const errors = [];
  
    if (!pelea.id_gallo) {
      errors.push('Debe seleccionar un gallo');
    }
  
    if (!pelea.fecha) {
      errors.push('La fecha es obligatoria');
    } else if (!isValidDate(pelea.fecha)) {
      errors.push('La fecha no es válida');
    }
  
    if (!pelea.resultado) {
      errors.push('El resultado es obligatorio');
    }
  
    if (pelea.duracion_min && isNaN(parseFloat(pelea.duracion_min))) {
      errors.push('La duración debe ser un número válido');
    }
  
    if (pelea.peso_antes && isNaN(parseFloat(pelea.peso_antes))) {
      errors.push('El peso antes debe ser un número válido');
    }
  
    if (pelea.peso_despues && isNaN(parseFloat(pelea.peso_despues))) {
      errors.push('El peso después debe ser un número válido');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Valida que un objeto cuidado médico tenga todos los campos requeridos
   * @param {Object} cuidado - Objeto con datos del cuidado médico
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  export const validateCuidadoMedico = (cuidado) => {
    const errors = [];
  
    if (!cuidado.id_gallo) {
      errors.push('Debe seleccionar un gallo');
    }
  
    if (!cuidado.tipo) {
      errors.push('El tipo de cuidado médico es obligatorio');
    }
  
    if (!cuidado.fecha) {
      errors.push('La fecha es obligatoria');
    } else if (!isValidDate(cuidado.fecha)) {
      errors.push('La fecha no es válida');
    }
  
    if (!cuidado.descripcion || cuidado.descripcion.trim() === '') {
      errors.push('La descripción es obligatoria');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Valida que un objeto entrenamiento tenga todos los campos requeridos
   * @param {Object} entrenamiento - Objeto con datos del entrenamiento
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  export const validateEntrenamiento = (entrenamiento) => {
    const errors = [];
  
    if (!entrenamiento.id_gallo) {
      errors.push('Debe seleccionar un gallo');
    }
  
    if (!entrenamiento.tipo) {
      errors.push('El tipo de entrenamiento es obligatorio');
    }
  
    if (!entrenamiento.fecha) {
      errors.push('La fecha es obligatoria');
    } else if (!isValidDate(entrenamiento.fecha)) {
      errors.push('La fecha no es válida');
    }
  
    if (entrenamiento.duracion_min && isNaN(parseFloat(entrenamiento.duracion_min))) {
      errors.push('La duración debe ser un número válido');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Valida si un string es una fecha válida en formato YYYY-MM-DD
   * @param {string} dateString - Fecha a validar
   * @returns {boolean} - true si es válida, false si no
   */
  export const isValidDate = (dateString) => {
    if (!dateString) return false;
    
    // Verificar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    
    // Verificar que sea una fecha válida
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };
  
  /**
   * Valida si un string es un correo electrónico válido
   * @param {string} email - Correo a validar
   * @returns {boolean} - true si es válido, false si no
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Valida si un token de GitHub es potencialmente válido
   * @param {string} token - Token a validar
   * @returns {boolean} - true si es potencialmente válido, false si no
   */
  export const isValidGithubToken = (token) => {
    if (!token) return false;
    
    // Los tokens personales de GitHub suelen empezar con "ghp_"
    // y tienen una longitud de al menos 40 caracteres
    return token.startsWith('ghp_') && token.length >= 40;
  };
  
  /**
   * Valida los datos de un formulario genérico
   * @param {Object} formData - Datos del formulario
   * @param {Array} requiredFields - Campos requeridos
   * @param {Object} validators - Validadores específicos para campos
   * @returns {Object} - { isValid: boolean, errors: { [fieldName]: string } }
   */
  export const validateForm = (formData, requiredFields = [], validators = {}) => {
    const errors = {};
    
    // Verificar campos requeridos
    requiredFields.forEach(field => {
      if (!formData[field] || 
          (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        errors[field] = `Este campo es obligatorio`;
      }
    });
    
    // Aplicar validadores específicos
    Object.entries(validators).forEach(([field, validator]) => {
      if (formData[field] && typeof validator === 'function') {
        const result = validator(formData[field]);
        if (result !== true && typeof result === 'string') {
          errors[field] = result;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Valida el formato de datos importados desde CSV/Excel
   * @param {Array} data - Datos importados
   * @param {string} entityType - Tipo de entidad
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  export const validateImportedData = (data, entityType) => {
    if (!data || !Array.isArray(data)) {
      return {
        isValid: false,
        errors: ['Los datos importados no tienen el formato correcto']
      };
    }
    
    const errors = [];
    
    // Validar que haya datos
    if (data.length === 0) {
      errors.push('No hay datos para importar');
      return { isValid: false, errors };
    }
    
    // Validaciones específicas según el tipo de entidad
    switch (entityType) {
      case 'Gallo':
        // Verificar campos requeridos en cada registro
        data.forEach((item, index) => {
          if (!item.nombre && !item.Nombre) {
            errors.push(`Fila ${index + 1}: Falta el nombre del gallo`);
          }
          if (!item.raza && !item.Raza) {
            errors.push(`Fila ${index + 1}: Falta la raza del gallo`);
          }
        });
        break;
        
      case 'Linea_Genetica':
        data.forEach((item, index) => {
          if (!item.nombre_linea && !item['Nombre Línea']) {
            errors.push(`Fila ${index + 1}: Falta el nombre de la línea genética`);
          }
        });
        break;
        
      case 'Peleas':
        data.forEach((item, index) => {
          if (!item.id_gallo && !item['ID Gallo']) {
            errors.push(`Fila ${index + 1}: Falta el ID del gallo`);
          }
          if (!item.fecha && !item.Fecha) {
            errors.push(`Fila ${index + 1}: Falta la fecha de la pelea`);
          }
          if (!item.resultado && !item.Resultado) {
            errors.push(`Fila ${index + 1}: Falta el resultado de la pelea`);
          }
        });
        break;
        
      // Más validaciones para otros tipos de entidades...
        
      default:
        // No hay validaciones específicas para este tipo
        break;
    }
    
    // Limitar la cantidad de errores mostrados
    if (errors.length > 10) {
      const extraErrors = errors.length - 10;
      errors.splice(10, errors.length - 10, `... y ${extraErrors} errores más`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };