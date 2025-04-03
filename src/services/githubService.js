// src/services/githubService.js
import { Octokit } from 'octokit';

/**
 * Servicio para interactuar con la API de GitHub y utilizar
 * los archivos del repositorio como almacenamiento de datos.
 */
class GitHubService {
  constructor() {
    this.octokit = null;
    this.owner = '';
    this.repo = '';
    this.branch = 'main';
    this.dataPath = 'data/';
    this.isAuthenticated = false;
  }

  /**
   * Inicializa el servicio con el token de acceso personal de GitHub
   * @param {string} token - Token de acceso personal de GitHub
   * @param {string} owner - Nombre de usuario en GitHub
   * @param {string} repo - Nombre del repositorio
   */
  initialize(token, owner, repo) {
    try {
      this.octokit = new Octokit({ auth: token });
      this.owner = owner;
      this.repo = repo;
      this.isAuthenticated = true;
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_owner', owner);
      localStorage.setItem('github_repo', repo);
      
      return true;
    } catch (error) {
      console.error('Error al inicializar GitHub Service:', error);
      return false;
    }
  }

  /**
   * Restaura la sesión desde localStorage si existe
   */
  restoreSession() {
    const token = localStorage.getItem('github_token');
    const owner = localStorage.getItem('github_owner');
    const repo = localStorage.getItem('github_repo');
    
    if (token && owner && repo) {
      return this.initialize(token, owner, repo);
    }
    return false;
  }

  /**
   * Cierra la sesión y elimina las credenciales guardadas
   */
  logout() {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');
    this.octokit = null;
    this.owner = '';
    this.repo = '';
    this.isAuthenticated = false;
  }

  /**
   * Verifica si existe un archivo en el repositorio
   * @param {string} path - Ruta del archivo
   * @returns {Promise<boolean>}
   */
  async fileExists(path) {
    if (!this.isAuthenticated) return false;
    
    try {
      await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: path,
        ref: this.branch
      });
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obtiene el contenido de un archivo
   * @param {string} path - Ruta del archivo
   * @returns {Promise<object|null>}
   */
  async getFileContent(path) {
    if (!this.isAuthenticated) return null;
    
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: path,
        ref: this.branch
      });
      
      // Decodificar el contenido en base64
      const content = Buffer.from(response.data.content, 'base64').toString();
      return {
        content: content,
        sha: response.data.sha
      };
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      console.error(`Error al obtener contenido de ${path}:`, error);
      throw error;
    }
  }

  /**
   * Crea o actualiza un archivo en el repositorio
   * @param {string} path - Ruta del archivo
   * @param {string} content - Contenido a guardar
   * @param {string} message - Mensaje de commit
   * @param {string} [sha] - SHA del archivo existente (para actualización)
   * @returns {Promise<boolean>}
   */
  async saveFile(path, content, message, sha = null) {
    if (!this.isAuthenticated) return false;
    
    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: path,
        message: message,
        content: Buffer.from(content).toString('base64'),
        sha: sha,
        branch: this.branch
      });
      return true;
    } catch (error) {
      console.error(`Error al guardar ${path}:`, error);
      return false;
    }
  }

  /**
   * Obtiene datos de una entidad específica
   * @param {string} entity - Nombre de la entidad (ej: 'Gallos')
   * @returns {Promise<Array>}
   */
  async getData(entity) {
    const path = `${this.dataPath}${entity}.json`;
    const fileData = await this.getFileContent(path);
    
    if (!fileData) {
      return { data: [], sha: null };
    }
    
    try {
      return { 
        data: JSON.parse(fileData.content), 
        sha: fileData.sha 
      };
    } catch (error) {
      console.error(`Error al parsear datos de ${entity}:`, error);
      return { data: [], sha: null };
    }
  }

  /**
   * Guarda datos de una entidad específica
   * @param {string} entity - Nombre de la entidad
   * @param {Array} data - Datos a guardar
   * @returns {Promise<boolean>}
   */
  async saveData(entity, data) {
    const path = `${this.dataPath}${entity}.json`;
    const fileExists = await this.fileExists(path);
    const content = JSON.stringify(data, null, 2);
    const message = fileExists
      ? `Actualización de datos de ${entity}`
      : `Creación inicial de datos de ${entity}`;
    
    let sha = null;
    if (fileExists) {
      const fileData = await this.getFileContent(path);
      sha = fileData ? fileData.sha : null;
    }
    
    return await this.saveFile(path, content, message, sha);
  }

  /**
   * Inicializa la estructura de datos en el repositorio
   * @returns {Promise<boolean>}
   */
  async initializeDataStructure() {
    if (!this.isAuthenticated) return false;
    
    try {
      // Verificar si el directorio de datos existe
      const dataExists = await this.fileExists(this.dataPath);
      
      if (!dataExists) {
        // Crear un archivo README.md en el directorio de datos
        await this.saveFile(
          `${this.dataPath}README.md`,
          '# Datos de la Aplicación Gallos Manager\n\nEste directorio contiene los archivos JSON con los datos de la aplicación.',
          'Inicialización del directorio de datos'
        );
      }
      
      // Inicializar cada entidad con un array vacío si no existe
      const entities = [
        'Gallo', 'Linea_Genetica', 'Cuidados_Medicos',
        'Entrenamientos', 'Alimentacion', 'Higiene', 
        'Peleas', 'Control_Pesos'
      ];
      
      for (const entity of entities) {
        const path = `${this.dataPath}${entity}.json`;
        const exists = await this.fileExists(path);
        
        if (!exists) {
          await this.saveFile(
            path,
            JSON.stringify([], null, 2),
            `Inicialización de datos de ${entity}`
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al inicializar la estructura de datos:', error);
      return false;
    }
  }
}

const githubService = new GitHubService();
export default githubService;