// src/utils/exportImport.js
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Utilidades para la importación y exportación de datos
 * en diferentes formatos (JSON, CSV, XLSX)
 */
class ExportImportUtils {
  // Definir las entidades admitidas y sus datos de ejemplo para plantillas
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
        id_linea: '1'
      }
    ],
    Linea_Genetica: [
      {
        id_linea: '1',
        nombre_linea: 'Ejemplo Línea',
        descripcion: 'Descripción de la línea genética de ejemplo'
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
        peso_despues: 2480
      }
    ],
    Cuidados_Medicos: [
      {
        id_cuidado: '1',
        id_gallo: '1',
        tipo: 'Vacuna',
        descripcion: 'Vacuna contra Newcastle',
        fecha: '2023-03-10'
      }
    ],
    Entrenamientos: [
      {
        id_entrenamiento: '1',
        id_gallo: '1',
        tipo: 'Carrera',
        duracion_min: 30,
        intensidad: 'Alta',
        fecha: '2023-04-05'
      }
    ],
    Alimentacion: [
      {
        id_alimentacion: '1',
        id_gallo: '1',
        tipo_alimento: 'Grano',
        cantidad_g: 150,
        fecha: '2023-04-01'
      }
    ],
    Higiene: [
      {
        id_higiene: '1',
        id_gallo: '1',
        tipo: 'Limpieza',
        descripcion: 'Limpieza de plumas',
        fecha: '2023-03-15'
      }
    ],
    Control_Pesos: [
      {
        id_control: '1',
        id_gallo: '1',
        peso_g: 2500,
        fecha: '2023-03-01'
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
    
    // Convertir cada entidad a una hoja
    Object.entries(data).forEach(([entityName, entityData]) => {
      if (Array.isArray(entityData) && entityData.length > 0) {
        // Crear hoja con los datos
        const worksheet = XLSX.utils.json_to_sheet(entityData);
        XLSX.utils.book_append_sheet(workbook, worksheet, entityName);
      } else {
        // Crear hoja vacía con encabezados si no hay datos
        const worksheet = XLSX.utils.aoa_to_sheet([['No hay datos']]);
        XLSX.utils.book_append_sheet(workbook, worksheet, entityName);
      }
    });
    
    // Convertir a blob para descarga
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Crea una plantilla de Excel con múltiples hojas para importación
   * @returns {Blob} - Blob con el archivo XLSX plantilla
   */
  createMultiSheetExcelTemplate() {
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de instrucciones
    const instructionsData = [
      ['INSTRUCCIONES PARA IMPORTACIÓN DE DATOS'],
      [''],
      ['1. Este archivo contiene hojas para cada tipo de entidad que puede importar.'],
      ['2. Cada hoja debe mantener el nombre exacto de la entidad (por ejemplo, "Gallo", "Linea_Genetica", etc.)'],
      ['3. La primera fila de cada hoja contiene los nombres de las columnas que debe mantener.'],
      ['4. Los datos de ejemplo muestran el formato correcto para cada campo.'],
      ['5. Los campos con (*) son obligatorios.'],
      ['6. Respete las referencias entre entidades. Por ejemplo, un Gallo debe referenciar un id_linea existente.'],
      ['7. Las fechas deben estar en formato YYYY-MM-DD (ej: 2023-01-31)'],
      ['8. Puede eliminar los datos de ejemplo, pero mantenga siempre la fila de encabezados.'],
      ['9. Puede eliminar hojas completas si no desea importar esa entidad.'],
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
    
    // Estilo para la hoja de instrucciones (ancho de columnas)
    instructionsSheet['!cols'] = [{ wch: 100 }];
    
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');
    
    // Crear hojas para cada entidad con datos de muestra
    Object.entries(this.ENTITY_TEMPLATES).forEach(([entityName, templateData]) => {
      if (Array.isArray(templateData) && templateData.length > 0) {
        // Crear dos filas de datos de ejemplo
        const secondRow = { ...templateData[0] };
        // Modificar algunos valores para el segundo ejemplo
        if (entityName === 'Gallo') {
          secondRow.id_gallo = '2';
          secondRow.nombre = 'Otro Gallo';
        } else if (entityName === 'Linea_Genetica') {
          secondRow.id_linea = '2';
          secondRow.nombre_linea = 'Otra Línea';
        }
        
        const entityData = [templateData[0], secondRow];
        
        // Crear hoja con datos y encabezados
        const worksheet = XLSX.utils.json_to_sheet(entityData);
        
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, entityName);
        
        // Establecer ancho de columnas basado en contenido
        const columnsWidth = [];
        const headers = Object.keys(entityData[0]);
        headers.forEach(header => {
          // Calcular ancho basado en la longitud del encabezado
          columnsWidth.push({ wch: Math.max(header.length, 15) });
        });
        worksheet['!cols'] = columnsWidth;
      }
    });
    
    // Convertir a blob para descarga
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
          
          // Resultado a devolver
          const result = {};
          
          // Procesar cada hoja - ignorar hoja de instrucciones
          workbook.SheetNames.forEach(sheetName => {
            // Ignorar hoja de instrucciones si existe
            if (sheetName.toLowerCase() === 'instrucciones') {
              return;
            }
            
            // Intentar normalizar el nombre de la entidad
            const normalizedEntityName = this.normalizeEntityName(sheetName);
            
            // Convertir hoja a JSON
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet);
            
            // Solo guardar si hay datos
            if (sheetData && sheetData.length > 0) {
              // Usar el nombre normalizado de la entidad como clave
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
    
    // Usar PapaParse para convertir a CSV
    return Papa.unparse(entityData);
  }

  /**
   * Parsea un archivo CSV para importar datos
   * @param {File} file - Archivo CSV a importar
   * @param {string} entityName - Nombre de la entidad
   * @returns {Promise<Object>} - Objeto con los datos importados
   */
  parseCSVFile(file, entityName) {
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
          
          const importedData = {};
          importedData[entityName] = results.data;
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
    
    // Si no hay datos, reportar error
    if (!data || Object.keys(data).length === 0) {
      errors.push('No se encontraron datos para importar');
      return { isValid: false, errors };
    }
    
    // Verificar que los nombres de entidades sean válidos
    Object.keys(data).forEach(entityName => {
      const normalizedName = this.normalizeEntityName(entityName);
      if (!requiredEntities.includes(normalizedName)) {
        errors.push(`"${entityName}" no es una entidad válida`);
      }
    });
    
    // Verificar que todos los datos sean arreglos
    Object.entries(data).forEach(([entity, entityData]) => {
      if (!Array.isArray(entityData)) {
        errors.push(`${entity}: Los datos no son un arreglo válido`);
      } else if (entityData.length === 0) {
        // No es un error, pero puede ser útil saberlo
        console.log(`${entity}: No hay datos para importar`);
      }
    });
    
    // Verificar las relaciones entre entidades (IDs)
    if (data.Gallo && data.Linea_Genetica) {
      // Verificar que todas las líneas genéticas referenciadas existan
      const lineaIds = data.Linea_Genetica.map(l => l.id_linea?.toString());
      
      data.Gallo.forEach((gallo, index) => {
        if (gallo.id_linea && !lineaIds.includes(gallo.id_linea.toString())) {
          errors.push(`Gallo [fila ${index+2}]: Referencia a línea genética inexistente (${gallo.id_linea})`);
        }
      });
    }
    
    // Verificar que todas las referencias a gallos existan
    if (data.Gallo) {
      const galloIds = data.Gallo.map(g => g.id_gallo?.toString());
      
      // Verificar referencias en cuidados médicos
      if (data.Cuidados_Medicos) {
        data.Cuidados_Medicos.forEach((cuidado, index) => {
          if (cuidado.id_gallo && !galloIds.includes(cuidado.id_gallo.toString())) {
            errors.push(`Cuidado médico [fila ${index+2}]: Referencia a gallo inexistente (${cuidado.id_gallo})`);
          }
        });
      }
      
      // Verificar referencias en entrenamientos
      if (data.Entrenamientos) {
        data.Entrenamientos.forEach((entrenamiento, index) => {
          if (entrenamiento.id_gallo && !galloIds.includes(entrenamiento.id_gallo.toString())) {
            errors.push(`Entrenamiento [fila ${index+2}]: Referencia a gallo inexistente (${entrenamiento.id_gallo})`);
          }
        });
      }
      
      // Verificar referencias en alimentación
      if (data.Alimentacion) {
        data.Alimentacion.forEach((alimento, index) => {
          if (alimento.id_gallo && !galloIds.includes(alimento.id_gallo.toString())) {
            errors.push(`Alimentación [fila ${index+2}]: Referencia a gallo inexistente (${alimento.id_gallo})`);
          }
        });
      }
      
      // Verificar referencias en higiene
      if (data.Higiene) {
        data.Higiene.forEach((higiene, index) => {
          if (higiene.id_gallo && !galloIds.includes(higiene.id_gallo.toString())) {
            errors.push(`Higiene [fila ${index+2}]: Referencia a gallo inexistente (${higiene.id_gallo})`);
          }
        });
      }
      
      // Verificar referencias en control de pesos
      if (data.Control_Pesos) {
        data.Control_Pesos.forEach((control, index) => {
          if (control.id_gallo && !galloIds.includes(control.id_gallo.toString())) {
            errors.push(`Control de peso [fila ${index+2}]: Referencia a gallo inexistente (${control.id_gallo})`);
          }
        });
      }
      
      // Verificar referencias en peleas
      if (data.Peleas) {
        data.Peleas.forEach((pelea, index) => {
          if (pelea.id_gallo && !galloIds.includes(pelea.id_gallo.toString())) {
            errors.push(`Pelea [fila ${index+2}]: Referencia a gallo inexistente (${pelea.id_gallo})`);
          }
        });
      }
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