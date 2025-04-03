import React from 'react';
import {
  BarChart2, Feather, Activity, FileText,
  Heart, Droplet, Award, Scale, Upload,
  X, Settings, LogOut, Github, Wifi, RefreshCw // Añadidos Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const {
      storageMode,
      setStorageMode,
      isGithubReady,
      disconnectFromGitHub,
      synchronizeWithGitHub,
      isLoading,
      syncStatus
    } = useData();

  // Lista de elementos de menú (se mantiene igual)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'Gallo', label: 'Gallos', icon: Feather },
    { id: 'Linea_Genetica', label: 'Líneas Genéticas', icon: Activity },
    { id: 'Peleas', label: 'Peleas', icon: Award },
    { id: 'Cuidados_Medicos', label: 'Cuidados Médicos', icon: Heart },
    { id: 'Entrenamientos', label: 'Entrenamientos', icon: Activity },
    { id: 'Alimentacion', label: 'Alimentación', icon: FileText },
    { id: 'Higiene', label: 'Higiene', icon: Droplet },
    { id: 'Control_Pesos', label: 'Control de Pesos', icon: Scale },
    { id: 'bulk_upload', label: 'Subida Masiva', icon: Upload },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false); // Cerrar menú móvil al cambiar de pestaña
  };

  const handleGitHubAction = () => {
      if (!isGithubReady) {
          // Si no hay credenciales, ir a configuración
          handleTabChange('settings');
      } else {
          // Si hay credenciales, sincronizar
          synchronizeWithGitHub();
      }
  }

  const handleDisconnect = async () => {
      // La confirmación está ahora en SettingsComponent, pero podemos añadir una aquí si se quiere
      // if (window.confirm('¿Desconectar de GitHub y cambiar a modo local?')) {
          await disconnectFromGitHub();
          handleTabChange('dashboard'); // Ir al dashboard después de desconectar
      // }
  }

  // Determinar el estado y texto del botón de GitHub/Sync
  let githubButtonText = 'Conectar a GitHub';
  let GitHubButtonIcon = Github;
  let githubButtonAction = handleGitHubAction;
  let githubButtonDisabled = isLoading;
  let showDisconnect = false;

  if (isGithubReady) {
      if (storageMode === 'github') {
          githubButtonText = syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar con GitHub';
          GitHubButtonIcon = syncStatus === 'syncing' ? RefreshCw : Github;
          githubButtonAction = synchronizeWithGitHub;
          githubButtonDisabled = isLoading && syncStatus === 'syncing';
          showDisconnect = true;
      } else { // Modo local pero con credenciales listas
          githubButtonText = 'Cambiar a Modo Online';
          GitHubButtonIcon = Wifi;
          githubButtonAction = () => setStorageMode('github'); // Llama a la función del contexto
          githubButtonDisabled = isLoading;
          showDisconnect = true; // Permitir desconectar incluso en modo local si hay credenciales
      }
  } else {
       // Sin credenciales, el botón lleva a settings
       githubButtonText = 'Configurar GitHub';
       GitHubButtonIcon = Github;
       githubButtonAction = () => handleTabChange('settings');
       githubButtonDisabled = isLoading;
       showDisconnect = false;
  }


  return (
    // Contenedor principal del Sidebar
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-900 to-blue-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`} // Flex container for footer
    >
      {/* Encabezado del Sidebar */}
      <div className="flex items-center justify-between p-4 mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center">
          <Feather className="mr-2" size={24} />
          <span className="tracking-wide">GALLOS MANAGER</span>
        </h1>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-white hover:text-gray-300 transition-colors duration-200"
          aria-label="Cerrar menú"
        >
          <X size={24} />
        </button>
      </div>

      {/* Menú Principal (con scroll si es necesario) */}
      <nav className="flex-1 overflow-y-auto mb-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center transition-all duration-200 text-sm ${
                activeTab === item.id
                  ? 'bg-white bg-opacity-25 shadow-inner font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => handleTabChange(item.id)}
            >
              <Icon className="mr-3 flex-shrink-0" size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer con acciones */}
      <div className="mt-auto border-t border-white border-opacity-20 pt-4 px-2 pb-4 space-y-2 flex-shrink-0">
         {/* Botón Dinámico GitHub */}
         <button
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200 text-sm ${githubButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`}
            onClick={githubButtonAction}
            disabled={githubButtonDisabled}
         >
            <GitHubButtonIcon className={`mr-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} size={18} />
            <span>{githubButtonText}</span>
         </button>

          {/* Botón Desconectar (condicional) */}
          {showDisconnect && (
             <button
                className="w-full text-left px-4 py-2 rounded-lg flex items-center text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200 text-sm disabled:opacity-50"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                <LogOut className="mr-3" size={18} />
                <span>Desconectar GitHub</span>
              </button>
          )}

          {/* Botón Configuración */}
         <button
          className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-all duration-200 text-sm ${
            activeTab === 'settings'
              ? 'bg-white bg-opacity-25 shadow-inner font-semibold'
              : 'hover:bg-white hover:bg-opacity-10'
          }`}
          onClick={() => handleTabChange('settings')}
          disabled={isLoading}
        >
          <Settings className="mr-3" size={18} />
          <span>Configuración</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;