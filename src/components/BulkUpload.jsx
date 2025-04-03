// src/components/BulkUpload.jsx
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Upload, AlertCircle, FileText, Check, X, Download, HelpCircle, FileSpreadsheet } from 'lucide-react';
import exportImportUtils from '../utils/exportImport';

const BulkUpload = () => {
  const { importDataFromJson, showNotification, exportDataToJson } = useData();
  
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('json');
  const [entity, setEntity] = useState('Gallo');
  const [validationResults, setValidationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [processingStep, setProcessingStep] = useState('upload'); // 'upload', 'validate', 'confirm'
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Lista de entidades disponibles
  const entities = [
    { id: 'Gallo', label: 'Gallos' },
    { id: 'Linea_Genetica', label: 'Líneas Genéticas' },
    { id: 'Peleas', label: 'Peleas' },
    { id: 'Cuidados_Medicos', label: 'Cuidados Médicos' },
    { id: 'Entrenamientos', label: 'Entrenamientos' },
    { id: 'Alimentacion', label: 'Alimentación' },
    { id: 'Higiene', label: 'Higiene' },
    { id: 'Control_Pesos', label: 'Control de Pesos' }
  ];
  
  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setIsUploaded(false);
      return;
    }
    
    // Verificar tipo de archivo
    const fileName = selectedFile.name.toLowerCase();
    if (importType === 'json' && !fileName.endsWith('.json')) {
      showNotification('Por favor, seleccione un archivo JSON', 'error');
      return;
    } else if (importType === 'csv' && !fileName.endsWith('.csv')) {
      showNotification('Por favor, seleccione un archivo CSV', 'error');
      return;
    } else if (importType === 'excel' && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      showNotification('Por favor, seleccione un archivo Excel', 'error');
      return;
    }
    
    setFile(selectedFile);
    setIsUploaded(true);
    setValidationResults(null);
    setProcessingStep('upload');
  };

  // Manejar eventos de arrastrar y soltar
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const selectedFile = files[0];
    const fileName = selectedFile.name.toLowerCase();
    
    // Verificar tipo de archivo según el tipo de importación seleccionado
    if (importType === 'json' && !fileName.endsWith('.json')) {
      showNotification('Por favor, seleccione un archivo JSON', 'error');
      return;
    } else if (importType === 'csv' && !fileName.endsWith('.csv')) {
      showNotification('Por favor, seleccione un archivo CSV', 'error');
      return;
    } else if (importType === 'excel' && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      showNotification('Por favor, seleccione un archivo Excel', 'error');
      return;
    }
    
    setFile(selectedFile);
    setIsUploaded(true);
    setValidationResults(null);
    setProcessingStep('upload');
  };
  
  // Validar el archivo seleccionado
  const validateFile = async () => {
    if (!file) {
      showNotification('Por favor, seleccione un archivo', 'error');
      return;
    }
    
    setIsLoading(true);
    setProcessingStep('validate');
    
    try {
      let parsedData;
      
      if (importType === 'json') {
        // Leer archivo JSON
        const reader = new FileReader();
        
        const jsonData = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
        
        parsedData = JSON.parse(jsonData);
      } 
      else if (importType === 'csv') {
        // Procesar CSV con PapaParse
        parsedData = await exportImportUtils.parseCSVFile(file, entity);
      } 
      else if (importType === 'excel') {
        // Procesar Excel con SheetJS - Ahora maneja múltiples hojas
        parsedData = await exportImportUtils.parseExcelFile(file);
      }
      
      // Validar la estructura de los datos
      const validationResults = exportImportUtils.validateImportedData(parsedData);
      setValidationResults({
        ...validationResults,
        data: parsedData
      });
      
      if (validationResults.isValid) {
        setProcessingStep('confirm');
      }
    } catch (error) {
      console.error('Error al validar archivo:', error);
      showNotification(`Error al validar archivo: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Importar los datos tras la confirmación
  const confirmImport = async () => {
    if (!validationResults || !validationResults.data) {
      showNotification('No hay datos para importar', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Importar los datos validados
      const success = importDataFromJson(JSON.stringify(validationResults.data));
      
      if (success) {
        showNotification('Datos importados correctamente', 'success');
        // Resetear el formulario
        setFile(null);
        setIsUploaded(false);
        setValidationResults(null);
        setProcessingStep('upload');
      } else {
        showNotification('Error al importar datos', 'error');
      }
    } catch (error) {
      console.error('Error al importar datos:', error);
      showNotification(`Error al importar datos: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar la importación
  const cancelImport = () => {
    setFile(null);
    setIsUploaded(false);
    setValidationResults(null);
    setProcessingStep('upload');
  };
  
  // Exportar plantillas individuales
  const exportTemplate = (type) => {
    // Datos de ejemplo para plantillas
    const templateData = {
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
    
    if (type === 'json') {
      // Exportar como JSON
      exportImportUtils.downloadString(
        JSON.stringify(templateData, null, 2),
        'plantilla_completa.json',
        'application/json'
      );
    } else if (type === 'csv') {
      // Exportar como CSV - Solo la entidad seleccionada
      const entityData = templateData[entity];
      const csvContent = exportImportUtils.entityToCsv(entityData);
      exportImportUtils.downloadString(
        csvContent,
        `plantilla_${entity.toLowerCase()}.csv`,
        'text/csv'
      );
    } else if (type === 'excel') {
      // Exportar plantilla Excel con todas las entidades
      const excelBlob = exportImportUtils.createMultiSheetExcelTemplate();
      exportImportUtils.downloadBlob(
        excelBlob,
        'plantilla_completa.xlsx'
      );
    }
  };
  
  // Paso 1: Selección del archivo
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Tipo de Importación</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              importType === 'json' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setImportType('json')}
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto mb-2">
              <FileText />
            </div>
            <h3 className="text-center font-medium">JSON</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              Importar un archivo JSON completo con todas las entidades
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              importType === 'csv' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setImportType('csv')}
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto mb-2">
              <FileText />
            </div>
            <h3 className="text-center font-medium">CSV</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              Importar una sola entidad desde archivo CSV
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              importType === 'excel' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setImportType('excel')}
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-2">
              <FileSpreadsheet />
            </div>
            <h3 className="text-center font-medium">Excel</h3>
            <p className="text-sm text-gray-500 text-center mt-1">
              Importar múltiples entidades desde hojas de Excel
            </p>
          </div>
        </div>
        
        {/* Mostrar selector de entidad solo para CSV */}
        {importType === 'csv' && (
          <div className="mt-4">
            <label htmlFor="entity" className="block text-sm font-medium text-gray-700">
              Seleccionar Entidad
            </label>
            <select
              id="entity"
              name="entity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
            >
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Instrucciones para formato Excel */}
        {importType === 'excel' && (
          <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-start space-x-3">
              <HelpCircle className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Importación de Excel multi-entidad</p>
                <p>Para una correcta importación desde Excel:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Cada hoja debe tener el nombre exacto de una entidad (Gallo, Linea_Genetica, etc.)</li>
                  <li>La primera fila debe contener los nombres de las columnas</li>
                  <li>Los IDs deben ser únicos y las referencias deben existir</li>
                </ul>
                <p className="mt-1">
                  Descargue la plantilla de ejemplo a continuación para ver el formato correcto.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cargar Archivo</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
            isUploaded ? 'border-green-300 bg-green-50' : 
            isDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploaded ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{file.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {
                    setFile(null);
                    setIsUploaded(false);
                  }}
                >
                  Cambiar archivo
                </button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600 hover:text-indigo-500">
                    Haga clic para seleccionar un archivo
                  </span>{' '}
                  o arrastre y suelte
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {importType === 'json' && 'JSON (.json)'}
                  {importType === 'csv' && 'CSV (.csv)'}
                  {importType === 'excel' && 'Excel (.xlsx, .xls)'}
                </p>
              </div>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept={
                  importType === 'json'
                    ? '.json'
                    : importType === 'csv'
                    ? '.csv'
                    : '.xlsx,.xls'
                }
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
        
        <label
          htmlFor="file-upload"
          className="mt-4 cursor-pointer block text-center"
        >
          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar archivo
          </span>
        </label>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900">¿No tiene un archivo para importar?</h3>
          <p className="mt-1 text-sm text-gray-500">
            Descargue una plantilla para comenzar:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => exportTemplate('json')}
            >
              <Download className="mr-2 h-4 w-4" />
              JSON Completo
            </button>
            
            {importType === 'csv' && (
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => exportTemplate('csv')}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV ({entities.find(e => e.id === entity)?.label})
              </button>
            )}
            
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => exportTemplate('excel')}
            >
              <Download className="mr-2 h-4 w-4" />
              Excel Multi-entidad
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={validateFile}
          disabled={!isUploaded || isLoading}
        >
          {isLoading ? 'Procesando...' : 'Validar Archivo'}
        </button>
      </div>
    </div>
  );
  
  // Paso 2: Validación de archivo
  const renderValidationStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Validación de Datos</h2>
        
        {isLoading ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Validando archivo, por favor espere...</p>
          </div>
        ) : validationResults ? (
          <>
            {validationResults.isValid ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Validación exitosa
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Los datos cumplen con la estructura requerida y están listos para ser importados.
                      </p>
                      {Object.keys(validationResults.data).map((entity) => (
                        <p key={entity}>
                          {entity}: {validationResults.data[entity]?.length || 0} registros
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Errores de validación
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationResults.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto" />
            <p className="mt-4 text-gray-500">No se ha realizado la validación.</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setProcessingStep('upload')}
        >
          Volver
        </button>
        
        {validationResults && validationResults.isValid && (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setProcessingStep('confirm')}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
  
  // Paso 3: Confirmación y aplicación de cambios
  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Confirmar Importación</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Está a punto de importar datos a la aplicación. Esta acción puede:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>Agregar nuevos registros</li>
                <li>Actualizar registros existentes</li>
                <li>Afectar a la integridad de los datos</li>
              </ul>
              <p className="mt-2 text-sm text-yellow-700">
                Se recomienda realizar una exportación de seguridad antes de continuar.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Resumen de datos a importar:</h3>
          
          <div className="mt-2 border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registros
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validationResults && validationResults.data && Object.keys(validationResults.data).map((entity) => (
                  <tr key={entity}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {validationResults.data[entity]?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => exportDataToJson()}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar copia de seguridad
          </button>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setProcessingStep('validate')}
        >
          Volver
        </button>
        
        <div className="space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={cancelImport}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={confirmImport}
            disabled={isLoading}
          >
            <Check className="mr-2 h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Confirmar Importación'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Upload className="mr-2 text-indigo-500" size={24} />
          Subida Masiva de Datos
        </h1>
      </div>
      
      {/* Mostrar paso actual */}
      {processingStep === 'upload' && renderUploadStep()}
      {processingStep === 'validate' && renderValidationStep()}
      {processingStep === 'confirm' && renderConfirmStep()}
    </div>
  );
};

export default BulkUpload;