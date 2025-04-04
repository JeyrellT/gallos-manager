import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import githubService from '../services/githubService';
import storageService from '../services/storageService';

// Creación del contexto
const DataContext = createContext();

/**
 * Proveedor del contexto de datos que maneja la lógica de almacenamiento
 * y sincronización entre GitHub y localStorage, incluyendo modo de operación.
 */
export const DataProvider = ({ children }) => {
  // Estados para los datos de cada entidad
  const [gallos, setGallos] = useState([]);
  const [lineasGeneticas, setLineasGeneticas] = useState([]);
  const [cuidadosMedicos, setCuidadosMedicos] = useState([]);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [alimentacion, setAlimentacion] = useState([]);
  const [higiene, setHigiene] = useState([]);
  const [peleas, setPeleas] = useState([]);
  const [controlPesos, setControlPesos] = useState([]);

  // Estados para la interfaz de usuario y configuración
  const [isLoading, setIsLoading] = useState(true); // Inicia como true hasta cargar datos
  const [notification, setNotification] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'error'
  const [storageMode, setStorageMode] = useState('local'); // 'local' o 'github'
  const [githubConfig, setGithubConfig] = useState({ token: '', owner: '', repo: '' });
  const [isGithubReady, setIsGithubReady] = useState(false); // Indica si las credenciales están configuradas

  /**
   * Muestra una notificación al usuario
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000); // Un poco más de tiempo
  }, []);

  /**
   * Sincroniza los datos locales con los de GitHub (si está en modo github)
   * Carga los datos desde GitHub, sobrescribiendo los locales.
   */
  const synchronizeWithGitHub = useCallback(async (isInitialLoad = false) => {
    if (storageMode !== 'github' || !isGithubReady) {
      if (!isInitialLoad) showNotification('La sincronización con GitHub no está activada o configurada.', 'warning');
      return;
    }

    console.log('Iniciando sincronización con GitHub...');
    setIsLoading(true);
    setSyncStatus('syncing');
    let syncError = null;

    try {
      const entities = [
        { name: 'Gallo', setter: setGallos },
        { name: 'Linea_Genetica', setter: setLineasGeneticas },
        { name: 'Cuidados_Medicos', setter: setCuidadosMedicos },
        { name: 'Entrenamientos', setter: setEntrenamientos },
        { name: 'Alimentacion', setter: setAlimentacion },
        { name: 'Higiene', setter: setHigiene },
        { name: 'Peleas', setter: setPeleas },
        { name: 'Control_Pesos', setter: setControlPesos },
      ];

      for (const entity of entities) {
        try {
          console.log(`Sincronizando entidad: ${entity.name}`);
          const { data, sha } = await githubService.getData(entity.name);
          if (data && Array.isArray(data)) {
            console.log(`Datos recibidos para ${entity.name}:`, data.length, "registros");
            entity.setter(data);
            storageService.saveData(entity.name, data);
          } else if (sha === null && data === null) {
            console.warn(`Archivo no encontrado en GitHub para ${entity.name}, asegurando estructura...`);
            await githubService.saveData(entity.name, []);
            entity.setter([]);
            storageService.saveData(entity.name, []);
          } else {
            console.warn(`Datos no válidos o vacíos recibidos para ${entity.name}`);
          }
        } catch (entityError) {
          console.error(`Error sincronizando ${entity.name}:`, entityError);
          syncError = entityError;
        }
      }

      if (syncError) {
        throw syncError;
      }

      setSyncStatus('synced');
      if (!isInitialLoad) showNotification('Datos sincronizados con GitHub correctamente', 'success');
      console.log('Sincronización con GitHub completada.');

    } catch (error) {
      console.error('Error general durante la sincronización con GitHub:', error);
      setSyncStatus('error');
      if (!isInitialLoad) showNotification(`Error al sincronizar datos: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [storageMode, isGithubReady, showNotification, setGallos, setLineasGeneticas, setCuidadosMedicos, setEntrenamientos, setAlimentacion, setHigiene, setPeleas, setControlPesos]);

  /**
   * Actualiza el modo de almacenamiento y lo guarda
   */
  const updateStorageMode = useCallback(async (mode) => {
    if (mode !== 'local' && mode !== 'github') return;

    // Si se cambia a GitHub y no hay credenciales, no hacer nada (o mostrar error)
    if (mode === 'github' && (!githubConfig.token || !githubConfig.owner || !githubConfig.repo)) {
      showNotification('Configure las credenciales de GitHub antes de activar la sincronización.', 'warning');
      return; // No cambia el modo
    }

    console.log(`Cambiando modo de almacenamiento a: ${mode}`);
    setStorageMode(mode);
    storageService.saveSetting('storageMode', mode);
    showNotification(`Modo de almacenamiento cambiado a: ${mode === 'github' ? 'Online (GitHub)' : 'Offline (Local)'}`, 'info');

    // Si se cambia a GitHub y hay credenciales, intentar sincronizar
    if (mode === 'github' && isGithubReady) {
      await synchronizeWithGitHub();
    }
  }, [githubConfig, isGithubReady, showNotification, synchronizeWithGitHub]);

  /**
   * Carga los datos iniciales de localStorage y la configuración
   */
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    console.log('Cargando datos iniciales...');
    storageService.initializeStorage(); // Asegura que todas las claves existan

    // Cargar datos de entidades
    setGallos(storageService.getData('Gallo'));
    setLineasGeneticas(storageService.getData('Linea_Genetica'));
    setCuidadosMedicos(storageService.getData('Cuidados_Medicos'));
    setEntrenamientos(storageService.getData('Entrenamientos'));
    setAlimentacion(storageService.getData('Alimentacion'));
    setHigiene(storageService.getData('Higiene'));
    setPeleas(storageService.getData('Peleas'));
    setControlPesos(storageService.getData('Control_Pesos'));

    // Cargar configuración - FIX: Changed from getSetting(key, default) to getSetting(key) with fallback value
    const savedMode = storageService.getSetting('storageMode') || 'local';
    const savedConfig = storageService.getSetting('githubConfig') || { token: '', owner: '', repo: '' };

    setStorageMode(savedMode);
    setGithubConfig(savedConfig);

    if (savedMode === 'github' && savedConfig.token && savedConfig.owner && savedConfig.repo) {
      console.log('Intentando restaurar sesión de GitHub...');
      const success = githubService.initialize(savedConfig.token, savedConfig.owner, savedConfig.repo);
      if (success) {
        setIsGithubReady(true);
        console.log('Sesión de GitHub restaurada, sincronizando...');
        // Sincronizar al inicio si está en modo github y conectado
        await synchronizeWithGitHub(true); // true indica que es la carga inicial
      } else {
        console.error('Fallo al restaurar sesión de GitHub con credenciales guardadas.');
        showNotification('Error al conectar con GitHub con credenciales guardadas.', 'error');
        // Cambiar a modo local si falla la inicialización
        await updateStorageMode('local');
        setIsGithubReady(false);
      }
    } else {
      setIsGithubReady(false); // No hay credenciales o no está en modo github
    }

    setIsLoading(false);
    console.log('Datos iniciales cargados. Modo:', savedMode);
  }, [synchronizeWithGitHub, updateStorageMode, showNotification]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Run on mount

  /**
   * Guarda las credenciales de GitHub y activa el modo si es exitoso
   */
  const connectToGitHub = async (token, owner, repo) => {
    setIsLoading(true);
    setSyncStatus('syncing');
    try {
      const success = githubService.initialize(token, owner, repo);
      if (success) {
        const newConfig = { token, owner, repo };
        setGithubConfig(newConfig);
        storageService.saveSetting('githubConfig', newConfig); // Guardar config
        setIsGithubReady(true);
        await githubService.initializeDataStructure(); // Asegura que los archivos existan
        // Cambiar a modo GitHub y sincronizar
        await updateStorageMode('github'); // Esto llamará a synchronizeWithGitHub internamente
        showNotification('Conectado y configurado para sincronizar con GitHub.', 'success');
      } else {
        throw new Error('Las credenciales proporcionadas no son válidas o hubo un problema de red.');
      }
    } catch (error) {
      console.error('Error al conectar con GitHub:', error);
      showNotification(`Error al conectar con GitHub: ${error.message}`, 'error');
      setIsGithubReady(false); // Falló la conexión
      // Opcional: Volver a modo local si falla
      // await updateStorageMode('local');
    } finally {
      setIsLoading(false);
      setSyncStatus(isGithubReady ? 'idle' : 'error');
    }
  };

  /**
   * Desconecta la aplicación de GitHub y cambia a modo local
   */
  const disconnectFromGitHub = async () => {
    githubService.logout(); // Limpia credenciales en el servicio
    setIsGithubReady(false);
    setGithubConfig({ token: '', owner: '', repo: '' }); // Limpia estado local
    
    // FIX: add a check to see if removeSetting method exists
    if (typeof storageService.removeSetting === 'function') {
      storageService.removeSetting('githubConfig'); 
    } else {
      // Alternative way to remove setting if the method doesn't exist
      storageService.saveSetting('githubConfig', null);
    }
    
    await updateStorageMode('local'); // Cambia a modo local
    showNotification('Desconectado de GitHub. Trabajando en modo local.', 'info');
  };

  /**
   * Guarda los datos actuales en GitHub (si está en modo github)
   */
  const saveDataToGitHub = async () => {
    if (storageMode !== 'github' || !isGithubReady) {
      showNotification('La sincronización con GitHub no está activada o configurada.', 'warning');
      return;
    }
    console.log('Guardando datos en GitHub...');
    setIsLoading(true);
    setSyncStatus('syncing');
    let saveError = null;

    try {
      const allData = {
        Gallo: gallos,
        Linea_Genetica: lineasGeneticas,
        Cuidados_Medicos: cuidadosMedicos,
        Entrenamientos: entrenamientos,
        Alimentacion: alimentacion,
        Higiene: higiene,
        Peleas: peleas,
        Control_Pesos: controlPesos
      };

      for (const entityName in allData) {
        try {
          console.log(`Guardando entidad: ${entityName}`);
          await githubService.saveData(entityName, allData[entityName]);
          console.log(`Entidad ${entityName} guardada en GitHub.`);
        } catch (entityError) {
          console.error(`Error guardando ${entityName} en GitHub:`, entityError);
          saveError = entityError; // Guardar el primer error
        }
      }

      if (saveError) {
        throw saveError; // Relanzar el primer error
      }

      setSyncStatus('synced');
      showNotification('Datos guardados en GitHub correctamente', 'success');
      console.log('Guardado en GitHub completado.');

    } catch (error) {
      console.error('Error general al guardar en GitHub:', error);
      setSyncStatus('error');
      showNotification(`Error al guardar en GitHub: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza los datos de una entidad. Guarda localmente siempre
   * y en GitHub si el modo es 'github' y está conectado.
   */
  const updateData = async (entityName, newData) => {
    // Actualizar el estado correspondiente
    switch (entityName) {
      case 'Gallo': setGallos(newData); break;
      case 'Linea_Genetica': setLineasGeneticas(newData); break;
      case 'Cuidados_Medicos': setCuidadosMedicos(newData); break;
      case 'Entrenamientos': setEntrenamientos(newData); break;
      case 'Alimentacion': setAlimentacion(newData); break;
      case 'Higiene': setHigiene(newData); break;
      case 'Peleas': setPeleas(newData); break;
      case 'Control_Pesos': setControlPesos(newData); break;
      default:
        console.error(`Entidad desconocida al actualizar: ${entityName}`);
        showNotification(`Error interno: Entidad desconocida ${entityName}`, 'error');
        return;
    }

    // Guardar siempre en localStorage
    storageService.saveData(entityName, newData);
    console.log(`Datos locales actualizados para: ${entityName}`);

    // Guardar en GitHub si está en modo online y conectado
    if (storageMode === 'github' && isGithubReady) {
      setIsLoading(true); // Mostrar indicador de carga para guardado en GitHub
      setSyncStatus('syncing');
      try {
        await githubService.saveData(entityName, newData);
        console.log(`Datos de ${entityName} guardados en GitHub.`);
        setSyncStatus('synced');
        // Podríamos mostrar una notificación específica de GitHub, pero puede ser mucho ruido
        // showNotification(`Datos de ${entityName} sincronizados con GitHub.`);
      } catch (error) {
        console.error(`Error al guardar ${entityName} en GitHub:`, error);
        setSyncStatus('error');
        showNotification(`Error al guardar ${entityName} en GitHub: ${error.message}. Los datos locales se guardaron.`, 'warning');
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Importa datos desde un archivo JSON (sobrescribe todo)
   */
  const importDataFromJson = async (jsonData) => {
    setIsLoading(true);
    try {
      const data = JSON.parse(jsonData);
      const requiredEntities = [
        'Gallo', 'Linea_Genetica', 'Cuidados_Medicos', 'Entrenamientos',
        'Alimentacion', 'Higiene', 'Peleas', 'Control_Pesos'
      ];
      const hasAllEntities = requiredEntities.every(entity =>
        data.hasOwnProperty(entity) && Array.isArray(data[entity])
      );

      if (!hasAllEntities) throw new Error('El formato del archivo JSON no es válido o faltan entidades.');

      // Actualizar estados locales
      setGallos(data.Gallo || []);
      setLineasGeneticas(data.Linea_Genetica || []);
      setCuidadosMedicos(data.Cuidados_Medicos || []);
      setEntrenamientos(data.Entrenamientos || []);
      setAlimentacion(data.Alimentacion || []);
      setHigiene(data.Higiene || []);
      setPeleas(data.Peleas || []);
      setControlPesos(data.Control_Pesos || []);

      // Guardar en localStorage
      storageService.saveAllData(data);
      showNotification('Datos importados y guardados localmente.', 'success');

      // Si está en modo GitHub, intentar guardar en GitHub
      if (storageMode === 'github' && isGithubReady) {
        await saveDataToGitHub(); // Reutiliza la función que guarda todo
      }
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error al importar datos:', error);
      showNotification(`Error al importar datos: ${error.message}`, 'error');
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Exporta todos los datos locales a un string JSON
   */
  const exportDataToJson = () => {
    const allData = storageService.getAllData(); // Exporta desde localStorage para consistencia
    return JSON.stringify(allData, null, 2);
  };

  /**
   * Obtiene las credenciales de GitHub (para mostrarlas en Settings)
   */
  const getGitHubCredentials = () => {
    return githubConfig;
  };

  // Valores proporcionados por el contexto
  const contextValue = {
    // Datos
    gallos, lineasGeneticas, cuidadosMedicos, entrenamientos, alimentacion, higiene, peleas, controlPesos,
    // Estado de la UI
    isLoading, notification, syncStatus,
    // Configuración y Estado de GitHub
    storageMode, // 'local' o 'github'
    isGithubReady, // Booleano si las credenciales están listas
    githubConfig, // { token, owner, repo } - Usar con cuidado
    // Métodos
    updateData, // Actualiza datos localmente y remotamente si aplica
    showNotification,
    connectToGitHub, // Configura y conecta a GitHub
    disconnectFromGitHub, // Borra credenciales y pasa a modo local
    synchronizeWithGitHub, // Fuerza la carga desde GitHub (si está en modo github)
    saveDataToGitHub, // Fuerza el guardado a GitHub (si está en modo github)
    importDataFromJson, // Importa y guarda local/remoto
    exportDataToJson, // Exporta datos locales
    setStorageMode: updateStorageMode, // Cambia entre 'local' y 'github'
    getGitHubCredentials, // Obtiene la config actual de GitHub
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useData = () => useContext(DataContext);

// Exportar el contexto también si es necesario en algún lugar
export default DataContext;