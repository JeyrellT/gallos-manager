import React, { useState } from 'react';
import { Settings, Wifi, WifiOff, Github, AlertTriangle, LogOut, Eye, EyeOff } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const SettingsComponent = () => {
  const {
    storageMode,
    setStorageMode,
    isGithubReady,
    connectToGitHub,
    disconnectFromGitHub,
    getGitHubCredentials,
    showNotification,
    isLoading,
    syncStatus
  } = useData();

  const initialCredentials = getGitHubCredentials() || { token: '', owner: '', repo: '' };
  const [githubToken, setGithubToken] = useState(''); // No mostrar token existente por seguridad
  const [githubOwner, setGithubOwner] = useState(initialCredentials.owner);
  const [githubRepo, setGithubRepo] = useState(initialCredentials.repo);
  const [showToken, setShowToken] = useState(false);

  const handleModeChange = async (event) => {
    const newMode = event.target.value;
    // Si intenta cambiar a GitHub sin credenciales listas, la función setStorageMode lo manejará
    await setStorageMode(newMode);
  };

  const handleConnect = async (event) => {
    event.preventDefault();
    if (!githubToken || !githubOwner.trim() || !githubRepo.trim()) {
      showNotification('Por favor, complete todos los campos de GitHub (Token, Usuario, Repositorio).', 'warning');
      return;
    }
    // Llamar a connectToGitHub del contexto
    await connectToGitHub(githubToken, githubOwner.trim(), githubRepo.trim());
    // Limpiar el campo del token después del intento
    setGithubToken('');
  };

  const handleDisconnect = async () => {
    if (window.confirm('¿Está seguro de que desea desconectar de GitHub? Cambiará a modo Offline y deberá volver a ingresar sus credenciales para sincronizar.')) {
      await disconnectFromGitHub();
      // Limpiar también los campos del formulario local
      setGithubOwner('');
      setGithubRepo('');
      setGithubToken('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        <Settings className="mr-2 text-gray-600" size={24} />
        Configuración
      </h1>

      {/* --- Sección Modo de Almacenamiento --- */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Modo de Almacenamiento</h2>
        <p className="text-sm text-gray-600 mb-4">
          Seleccione cómo desea guardar y acceder a sus datos.
        </p>
        <fieldset className="space-y-4">
          <legend className="sr-only">Modo de almacenamiento</legend>
          {/* Modo Offline */}
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="mode-local"
                name="storageMode"
                type="radio"
                value="local"
                checked={storageMode === 'local'}
                onChange={handleModeChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="mode-local" className="font-medium text-gray-700 flex items-center">
                <WifiOff className="mr-2 h-5 w-5 text-red-600" />
                Offline (Solo Almacenamiento Local)
              </label>
              <p className="text-gray-500">Los datos se guardan únicamente en este navegador. No hay sincronización ni copia de seguridad externa.</p>
            </div>
          </div>
          {/* Modo Online */}
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="mode-github"
                name="storageMode"
                type="radio"
                value="github"
                checked={storageMode === 'github'}
                onChange={handleModeChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="mode-github" className="font-medium text-gray-700 flex items-center">
                <Wifi className="mr-2 h-5 w-5 text-green-600" />
                Online (Sincronización con GitHub)
              </label>
              <p className="text-gray-500">Los datos se sincronizan con un repositorio privado en GitHub, permitiendo acceso desde otros dispositivos y copias de seguridad.</p>
              {!isGithubReady && storageMode === 'github' && (
                <p className="mt-1 text-xs text-orange-600 flex items-center">
                  <AlertTriangle size={14} className="mr-1" /> ¡Requiere configuración de credenciales abajo!
                </p>
              )}
            </div>
          </div>
        </fieldset>
      </div>

      {/* --- Sección Configuración GitHub (Visible siempre, pero más relevante en modo 'github') --- */}
      <div className={`bg-white rounded-lg shadow-sm p-6 border ${isGithubReady && storageMode === 'github' ? 'border-green-300' : 'border-gray-200'}`}>
        <h2 className="text-lg font-medium text-gray-900 mb-1 flex items-center">
          <Github className="mr-2 h-5 w-5" />
          Configuración de GitHub
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Necesario para el modo Online. Use un <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Token de Acceso Personal (Clásico)</a> con permisos `repo` completos.
        </p>

        {isGithubReady ? (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
            Conectado a GitHub como <strong>{initialCredentials.owner}</strong> en el repositorio <strong>{initialCredentials.repo}</strong>.
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="ml-4 inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50"
            >
              <LogOut size={14} className="mr-1" /> Desconectar
            </button>
          </div>
        ) : (
          <p className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            No conectado a GitHub. Ingrese sus credenciales para habilitar la sincronización.
          </p>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          {/* Usuario/Organización */}
          <div>
            <label htmlFor="githubOwner" className="block text-sm font-medium text-gray-700">Usuario u Organización de GitHub*</label>
            <input
              type="text"
              id="githubOwner"
              name="githubOwner"
              value={githubOwner}
              onChange={(e) => setGithubOwner(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
              placeholder="su-usuario-github"
              required
              disabled={isLoading}
            />
          </div>
          {/* Repositorio */}
          <div>
            <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700">Nombre del Repositorio*</label>
            <input
              type="text"
              id="githubRepo"
              name="githubRepo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
              placeholder="gallos-manager-data"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Se recomienda usar un repositorio privado dedicado para estos datos.
            </p>
          </div>
          {/* Token */}
          <div>
            <label htmlFor="githubToken" className="block text-sm font-medium text-gray-700">
              Token de Acceso Personal (Clásico)* {isGithubReady && '(Ingrese solo si desea cambiarlo)'}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showToken ? 'text' : 'password'}
                id="githubToken"
                name="githubToken"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="block w-full pr-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                placeholder={isGithubReady ? '••••••••••••••••••••••• (Oculto)' : 'ghp_...'}
                required={!isGithubReady} // Solo requerido si no está conectado
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowToken(!showToken)} className="text-gray-400 hover:text-gray-600" title={showToken ? "Ocultar" : "Mostrar"}>
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Necesita permisos `repo` (control total de repositorios privados). El token se guarda localmente en su navegador.
            </p>
          </div>

          {/* Botón Conectar/Actualizar */}
          <div>
            <button
              type="submit"
              disabled={isLoading || (isGithubReady && !githubToken)} // Deshabilitar si está conectado y no se ingresó nuevo token
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && syncStatus === 'syncing' ? 'Conectando...' : (isGithubReady ? 'Actualizar Credenciales' : 'Conectar y Habilitar Sincronización')}
            </button>
          </div>
        </form>
      </div>

      {/* --- Sección Configuraciones Básicas (Placeholder) --- */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Otras Configuraciones</h2>
        <p className="text-gray-600 mb-4">
          Aquí podrías añadir opciones futuras como tema visual, idioma, etc.
        </p>
        <div className="mt-4 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700">Formato de Fecha Preferido (Ejemplo)</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" disabled>
            <option>DD/MM/AAAA</option>
            <option>MM/DD/AAAA</option>
            <option>AAAA-MM-DD</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Funcionalidad no implementada.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;