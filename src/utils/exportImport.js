// src/utils/exportImport.js
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Utilidades para la importación y exportación de datos
 * en diferentes formatos (JSON, CSV, XLSX)
 */
class ExportImportUtils {
  // Plantillas completas para cada entidad
  ENTITY_TEMPLATES = {
    Gallo: [
      { 
        id_gallo: '1', 
        nombre: 'Ejemplo Gallo', 
        raza: 'Raza Ejemplo', 
        peso_actual: '2500', 
        estado: 'Activo', 
        fecha_nacimiento: '2023-01-01',
        sexo: 'Macho',
        altura: '25',
        color: 'Negro',
        descripcion: 'Descripción del gallo',
        id_linea: '1',
        notas: 'Notas adicionales'
      }
    ],
    Linea_Genetica: [
      {
        id_linea: '1',
        nombre_linea: 'Ejemplo Línea',
        descripcion: 'Descripción detallada de la línea genética',
        origen: 'Origen de la línea',
        caracteristicas: 'Características principales',
        notas: 'Notas sobre la línea'
      }
    ],
    Peleas: [
      {
        id_pelea: '1',
        id_gallo: '1',
        fecha: '2023-05-15',
        resultado: 'Victoria',
        duracion_min: 12,
        peso_antes: 2500,
        peso_despues: 2480,
        observaciones: 'Detalles de la pelea',
        lugar: 'Ubicación',
        rival: 'Información del rival'
      }
    ],
    Cuidados_Medicos: [
      {
        id_cuidado: '1',
        id_gallo: '1',
        tipo: 'Vacuna',
        descripcion: 'Vacuna contra Newcastle',
        fecha: '2023-03-10',
        medicamento: 'Nombre del medicamento',
        dosis: 'Dosis aplicada',
        proxima_fecha: '2023-06-10',
        notas: 'Observaciones del tratamiento'
      }
    ],
    Entrenamientos: [
      {
        id_entrenamiento: '1',
        id_gallo: '1',
        tipo: 'Carrera',
        duracion_min: 30,
        intensidad: 'Alta',
        fecha: '2023-04-05',
        descripcion: 'Detalles del entrenamiento',
        resultados: 'Resultados observados',
        notas: 'Notas adicionales'
      }
    ],
    Alimentacion: [
      {
        id_alimentacion: '1',
        id_gallo: '1',
        tipo_alimento: 'Grano',
        cantidad_g: 150,
        fecha: '2023-04-01',
        suplementos: 'Suplementos adicionales',
        hora: '08:00',
        notas: 'Observaciones de la alimentación'
      }
    ],
    Higiene: [
      {
        id_higiene: '1',
        id_gallo: '1',
        tipo: 'Limpieza',
        descripcion: 'Limpieza de plumas',
        fecha: '2023-03-15',
        productos: 'Productos utilizados',
        procedimiento: 'Descripción del procedimiento',
        notas: 'Observaciones adicionales'
      }
    ],
    Control_Pesos: [
      {
        id_control: '1',
        id_gallo: '1',
        peso_g: 2500,
        fecha: '2023-03-01',
        observaciones: 'Notas sobre el peso',
        cambio_dieta: 'Ajustes en la dieta',
        motivo: 'Razón del control'
      }
    ]
  };

  // Mapeo de nombres de entidades para normalización
  ENTITY_NAME_MAP = {
    'gallo': 'Gallo',
    'gallos': 'Gallo',
    'linea': 'Linea_Genetica',
    'lineas': 'Linea_Genetica',
    'linea genetica': 'Linea_Genetica',
    'lineas geneticas': 'Linea_Genetica',
    'linea_genetica': 'Linea_Genetica',
    'pelea': 'Peleas',
    'peleas': 'Peleas',
    'cuidado': 'Cuidados_Medicos',
    'cuidados': 'Cuidados_Medicos',
    'cuidados medicos': 'Cuidados_Medicos',
    'cuidados_medicos': 'Cuidados_Medicos',
    'entrenamiento': 'Entrenamientos',
    'entrenamientos': 'Entrenamientos',
    'alimentacion': 'Alimentacion',
    'alimentación': 'Alimentacion',
    'higiene': 'Higiene',
    'control': 'Control_Pesos',
    'control de peso': 'Control_Pesos',
    'control de pesos': 'Control_Pesos',
    'control_pesos': 'Control_Pesos'
  };

  /**
   * Convierte un objeto de entidades a un archivo XLSX para descarga
   * @param {Object} data - Objeto con los datos de todas las entidades
   * @returns {Blob} - Blob con el archivo XLSX
   */
  entitiesToExcel(data) {
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de instrucciones
    const instructionsData = [
      ['INSTRUCCIONES'],
      [''],
      ['Este archivo contiene los datos exportados de todas las entidades.'],
      ['Puede usar este archivo como respaldo o para importar los datos en otra instancia.'],
      [''],
      ['Entidades incluidas:'],
      ...Object.keys(data).map(entity => [`- ${entity}`])
    ];
    
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');
    
    // Convertir cada entidad a una hoja
    Object.entries(data).forEach(([entityName, entityData]) => {
      if (Array.isArray(entityData) && entityData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(entityData);
        
        // Ajustar ancho de columnas
        const columnsWidth = [];
        const headers = Object.keys(entityData[0]);
        headers.forEach(header => {
          columnsWidth.push({ wch: Math.max(header.length, 15) });
        });
        worksheet['!cols'] = columnsWidth;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, entityName);
      }
    });
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Crea una plantilla de Excel con múltiples hojas para importación
   * @returns {Blob} - Blob con el archivo XLSX plantilla
   */
  createMultiSheetExcelTemplate() {
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de instrucciones detallada
    const instructionsData = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE DATOS'],
      [''],
      ['1. Este archivo contiene hojas para cada tipo de entidad que puede importar.'],
      ['2. Cada hoja debe mantener el nombre exacto de la entidad (por ejemplo, "Gallo", "Linea_Genetica", etc.)'],
      ['3. La primera fila de cada hoja contiene los nombres de las columnas que debe mantener.'],
      ['4. Los datos de ejemplo muestran el formato correcto para cada campo.'],
      ['5. Los campos con (*) son obligatorios:'],
      ['   - Gallo: nombre, raza, id_linea'],
      ['   - Linea_Genetica: nombre_linea'],
      ['   - Demás entidades: id_gallo, fecha'],
      ['6. Respete las referencias entre entidades:'],
      ['   - Los gallos deben referenciar un id_linea existente'],
      ['   - Las demás entidades deben referenciar un id_gallo existente'],
      ['7. Las fechas deben estar en formato YYYY-MM-DD (ej: 2023-01-31)'],
      ['8. Los campos numéricos (pesos, duraciones) deben ser números sin texto'],
      ['9. Puede eliminar los datos de ejemplo, pero mantenga la fila de encabezados'],
      ['10. No es necesario incluir todas las hojas, solo las que desea importar'],
      [''],
      ['ENTIDADES DISPONIBLES:'],
      ['- Gallo: Información básica de cada gallo'],
      ['- Linea_Genetica: Líneas genéticas de los gallos'],
      ['- Peleas: Registro de peleas'],
      ['- Cuidados_Medicos: Registro de cuidados médicos'],
      ['- Entrenamientos: Registro de entrenamientos'],
      ['- Alimentacion: Registro de alimentación'],
      ['- Higiene: Registro de higiene'],
      ['- Control_Pesos: Registro de control de pesos']
    ];
    
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');
    
    // Crear hojas para cada entidad con datos de ejemplo
    Object.entries(this.ENTITY_TEMPLATES).forEach(([entityName, templateData]) => {
      if (Array.isArray(templateData) && templateData.length > 0) {
        // Crear dos filas de ejemplo con datos diferentes
        const secondRow = { ...templateData[0] };
        
        // Modificar IDs y algunos valores para el segundo ejemplo
        Object.keys(secondRow).forEach(key => {
          if (key.startsWith('id_')) {
            secondRow[key] = String(parseInt(secondRow[key]) + 1);
          }
        });
        
        if (secondRow.nombre) secondRow.nombre += ' 2';
        if (secondRow.nombre_linea) secondRow.nombre_linea += ' 2';
        if (secondRow.fecha) {
          const date = new Date(secondRow.fecha);
          date.setDate(date.getDate() + 1);
          secondRow.fecha = date.toISOString().split('T')[0];
        }
        
        const entityData = [templateData[0], secondRow];
        const worksheet = XLSX.utils.json_to_sheet(entityData);
        
        // Ajustar ancho de columnas
        const columnsWidth = [];
        const headers = Object.keys(entityData[0]);
        headers.forEach(header => {
          columnsWidth.push({ wch: Math.max(header.length, 15) });
        });
        worksheet['!cols'] = columnsWidth;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, entityName);
      }
    });
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  /**
   * Normaliza el nombre de una entidad
   * @param {string} sheetName - Nombre de la hoja/entidad a normalizar
   * @returns {string} - Nombre normalizado o el original si no existe mapeo
   */
  normalizeEntityName(sheetName) {
    const normalized = sheetName.toLowerCase().trim();
    return this.ENTITY_NAME_MAP[normalized] || sheetName;
  }

  /**
   * Parsea un archivo Excel para importar datos
   * @param {File} file - Archivo XLSX a importar
   * @returns {Promise<Object>} - Objeto con los datos importados
   */
  async parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const result = {};
          
          workbook.SheetNames.forEach(sheetName => {
            if (sheetName.toLowerCase() === 'instrucciones') return;
            
            const normalizedEntityName = this.normalizeEntityName(sheetName);
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet);
            
            if (sheetData && sheetData.length > 0) {
              result[normalizedEntityName] = sheetData;
            }
          });
          
          resolve(result);
        } catch (error) {
          reject(new Error(`Error al procesar el archivo Excel: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convierte una entidad a CSV para descarga
   * @param {Array} entityData - Datos de la entidad
   * @returns {string} - Contenido CSV
   */
  entityToCsv(entityData) {
    if (!Array.isArray(entityData) || entityData.length === 0) {
      return 'No hay datos';
    }
    return Papa.unparse(entityData);
  }

  /**
   * Parsea un archivo CSV para importar datos
   * @param {File} file - Archivo CSV a importar
   * @param {string} entityName - Nombre de la entidad
   * @returns {Promise<Object>} - Objeto con los datos importados
   */
  async parseCSVFile(file, entityName) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(new Error(`Error en el CSV: ${results.errors[0].message}`));
            return;
          }
          
          const importedData = {
            [entityName]: results.data
          };
          resolve(importedData);
        },
        error: (error) => {
          reject(new Error(`Error al procesar el CSV: ${error.message}`));
        }
      });
    });
  }

  /**
   * Valida el formato de los datos importados
   * @param {Object} data - Datos importados
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  validateImportedData(data) {
    const errors = [];
    const requiredEntities = [
      'Gallo', 'Linea_Genetica', 'Cuidados_Medicos',
      'Entrenamientos', 'Alimentacion', 'Higiene', 
      'Peleas', 'Control_Pesos'
    ];
    
    if (!data || Object.keys(data).length === 0) {
      errors.push('No se encontraron datos para importar');
      return { isValid: false, errors };
    }
    
    // Verificar entidades válidas
    Object.keys(data).forEach(entityName => {
      const normalizedName = this.normalizeEntityName(entityName);
      if (!requiredEntities.includes(normalizedName)) {
        errors.push(`"${entityName}" no es una entidad válida`);
      }
    });
    
    // Verificar estructura de datos
    Object.entries(data).forEach(([entity, entityData]) => {
      if (!Array.isArray(entityData)) {
        errors.push(`${entity}: Los datos no son un arreglo válido`);
      } else if (entityData.length === 0) {
        console.log(`${entity}: No hay datos para importar`);
      } else {
        // Validar campos requeridos según la entidad
        entityData.forEach((item, index) => {
          switch(entity) {
            case 'Gallo':
              if (!item.nombre) errors.push(`Gallo [fila ${index+2}]: Falta el nombre`);
              if (!item.raza) errors.push(`Gallo [fila ${index+2}]: Falta la raza`);
              if (!item.id_linea) errors.push(`Gallo [fila ${index+2}]: Falta el ID de línea genética`);
              break;
            case 'Linea_Genetica':
              if (!item.nombre_linea) errors.push(`Línea Genética [fila ${index+2}]: Falta el nombre`);
              break;
            default:
              if (!item.id_gallo) errors.push(`${entity} [fila ${index+2}]: Falta el ID del gallo`);
              if (!item.fecha) errors.push(`${entity} [fila ${index+2}]: Falta la fecha`);
          }
        });
      }
    });
    
    // Verificar referencias entre entidades
    if (data.Gallo && data.Linea_Genetica) {
      const lineaIds = data.Linea_Genetica.map(l => l.id_linea?.toString());
      
      data.Gallo.forEach((gallo, index) => {
        if (gallo.id_linea && !lineaIds.includes(gallo.id_linea.toString())) {
          errors.push(`Gallo [fila ${index+2}]: Referencia a línea genética inexistente (${gallo.id_linea})`);
        }
      });
    }
    
    if (data.Gallo) {
      const galloIds = data.Gallo.map(g => g.id_gallo?.toString());
      
      // Verificar referencias en todas las entidades relacionadas
      Object.entries(data).forEach(([entity, entityData]) => {
        if (entity !== 'Gallo' && entity !== 'Linea_Genetica') {
          entityData.forEach((item, index) => {
            if (item.id_gallo && !galloIds.includes(item.id_gallo.toString())) {
              errors.push(`${entity} [fila ${index+2}]: Referencia a gallo inexistente (${item.id_gallo})`);
            }
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Descarga un archivo blob
   * @param {Blob} blob - Blob a descargar
   * @param {string} filename - Nombre del archivo
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Descarga un string como archivo
   * @param {string} content - Contenido a descargar
   * @param {string} filename - Nombre del archivo
   * @param {string} type - Tipo MIME
   */
  downloadString(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    this.downloadBlob(blob, filename);
  }
}

const exportImportUtils = new ExportImportUtils();
export default exportImportUtils;