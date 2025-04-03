// src/services/storageService.js

/**
 * Servicio para manejar el almacenamiento local de datos
 * cuando no hay conexión a GitHub o como caché temporal.
 */
class StorageService {
    constructor() {
      this.storagePrefix = 'gallos_manager_';
      this.entities = [
        'Gallo', 'Linea_Genetica', 'Cuidados_Medicos',
        'Entrenamientos', 'Alimentacion', 'Higiene', 
        'Peleas', 'Control_Pesos'
      ];
    }
  
    /**
     * Obtiene los datos de una entidad desde localStorage
     * @param {string} entity - Nombre de la entidad
     * @returns {Array} - Arreglo con los datos
     */
    getData(entity) {
      try {
        const data = localStorage.getItem(`${this.storagePrefix}${entity}`);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error(`Error al obtener datos locales de ${entity}:`, error);
        return [];
      }
    }
  
    /**
     * Guarda los datos de una entidad en localStorage
     * @param {string} entity - Nombre de la entidad
     * @param {Array} data - Datos a guardar
     * @returns {boolean} - Resultado de la operación
     */
    saveData(entity, data) {
      try {
        localStorage.setItem(
          `${this.storagePrefix}${entity}`,
          JSON.stringify(data)
        );
        return true;
      } catch (error) {
        console.error(`Error al guardar datos locales de ${entity}:`, error);
        return false;
      }
    }
  
    /**
     * Inicializa el almacenamiento local con datos vacíos
     * para cada entidad si no existen
     */
    initializeStorage() {
      this.entities.forEach(entity => {
        if (!localStorage.getItem(`${this.storagePrefix}${entity}`)) {
          this.saveData(entity, []);
        }
      });
    }
  
    /**
     * Obtiene un objeto con todos los datos de todas las entidades
     * @returns {Object} - Objeto con los datos de todas las entidades
     */
    getAllData() {
      const allData = {};
      this.entities.forEach(entity => {
        allData[entity] = this.getData(entity);
      });
      return allData;
    }
  
    /**
     * Guarda un objeto con datos de todas las entidades
     * @param {Object} allData - Objeto con datos de todas las entidades
     * @returns {boolean} - Resultado de la operación
     */
    saveAllData(allData) {
      try {
        Object.keys(allData).forEach(entity => {
          if (this.entities.includes(entity)) {
            this.saveData(entity, allData[entity]);
          }
        });
        return true;
      } catch (error) {
        console.error('Error al guardar todos los datos locales:', error);
        return false;
      }
    }
  
    /**
     * Elimina todos los datos almacenados localmente
     */
    clearAllData() {
      this.entities.forEach(entity => {
        localStorage.removeItem(`${this.storagePrefix}${entity}`);
      });
    }
  
    /**
     * Exporta todos los datos a un archivo JSON
     * @returns {string} - String con el contenido JSON para descargar
     */
    exportAllData() {
      return JSON.stringify(this.getAllData(), null, 2);
    }
  
    /**
     * Importa datos desde un archivo JSON
     * @param {string} jsonData - String con datos en formato JSON
     * @returns {boolean} - Resultado de la operación
     */
    importData(jsonData) {
      try {
        const data = JSON.parse(jsonData);
        return this.saveAllData(data);
      } catch (error) {
        console.error('Error al importar datos:', error);
        return false;
      }
    }

    /**
     * Obtiene un valor de configuración desde localStorage
     * @param {string} key - Clave de la configuración
     * @returns {any} - Valor de la configuración o null si no existe
     */
    getSetting(key) {
      try {
        const value = localStorage.getItem(`${this.storagePrefix}setting_${key}`);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error(`Error al obtener la configuración ${key}:`, error);
        return null;
      }
    }

    /**
     * Guarda un valor de configuración en localStorage
     * @param {string} key - Clave de la configuración
     * @param {any} value - Valor de la configuración
     * @returns {boolean} - Resultado de la operación
     */
    saveSetting(key, value) {
      try {
        localStorage.setItem(
          `${this.storagePrefix}setting_${key}`,
          JSON.stringify(value)
        );
        return true;
      } catch (error) {
        console.error(`Error al guardar la configuración ${key}:`, error);
        return false;
      }
    }

    /**
     * Elimina un valor de configuración del localStorage
     * @param {string} key - Clave de la configuración a eliminar
     * @returns {boolean} - Resultado de la operación
     */
    removeSetting(key) {
      try {
        localStorage.removeItem(`${this.storagePrefix}setting_${key}`);
        return true;
      } catch (error) {
        console.error(`Error al eliminar la configuración ${key}:`, error);
        return false;
      }
    }
}

// Create and export a singleton instance
const storageService = new StorageService();
Object.freeze(storageService); // Prevent modifications to the instance
export default storageService;