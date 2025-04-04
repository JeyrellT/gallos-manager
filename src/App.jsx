import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GallosList from './components/GallosList';
import GalloDetail from './components/GalloDetail';
import LineaGeneticaList from './components/LineaGeneticaList';
import PeleasList from './components/PeleasList';
import CuidadosMedicosList from './components/CuidadosMedicosList';
import EntrenamientosList from './components/EntrenamientosList';
import AlimentacionList from './components/AlimentacionList';
import HigieneList from './components/HigieneList';
import ControlPesosList from './components/ControlPesosList';
import SettingsComponent from './components/SettingsComponent'; // <--- Importar Settings
import BulkUpload from './components/BulkUpload';
import Notification from './components/Notification';
import './App.css';

const AppContent = () => {
  const { notification, isLoading } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGallo, setSelectedGallo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab !== 'Gallo') {
      setSelectedGallo(null);
    }
  }, [activeTab]);

  const renderMainContent = () => {
    if (selectedGallo && activeTab === 'Gallo') {
      return <GalloDetail gallo={selectedGallo} onBack={() => setSelectedGallo(null)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />; // Pasar setActiveTab al Dashboard
      case 'Gallo':
        return <GallosList searchTerm={searchTerm} onSelectGallo={setSelectedGallo} />;
      case 'Linea_Genetica':
        return <LineaGeneticaList searchTerm={searchTerm} />;
      case 'Peleas':
        return <PeleasList 
          searchTerm={searchTerm} 
          setActiveTab={setActiveTab} 
          onSelectGallo={setSelectedGallo}
        />;
      case 'Cuidados_Medicos':
        return <CuidadosMedicosList 
          searchTerm={searchTerm} 
          setActiveTab={setActiveTab} 
          onSelectGallo={setSelectedGallo}
        />;
      case 'Entrenamientos':
        return <EntrenamientosList 
          searchTerm={searchTerm} 
          setActiveTab={setActiveTab} 
          onSelectGallo={setSelectedGallo} 
        />;
      case 'Alimentacion':
        return <AlimentacionList searchTerm={searchTerm} />;
      case 'Higiene':
        return <HigieneList searchTerm={searchTerm} />;
      case 'Control_Pesos':
        return <ControlPesosList searchTerm={searchTerm} />;
      case 'bulk_upload':
        return <BulkUpload />;
      case 'settings': // <--- Añadido el caso para Settings
        return <SettingsComponent />;
       // El caso 'github_setup' ya no es necesario, se maneja en 'settings'
      default:
        return <Dashboard setActiveTab={setActiveTab}/>; // Pasar setActiveTab también aquí por si acaso
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 relative"> {/* Añadido relative */}
          {/* Indicador de carga global mejorado */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-lg border border-indigo-200">
                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-indigo-700">
                  {isLoading ? 'Cargando...' : 'Sincronizado'}
                </span>
              </div>
            </div>
          )}
          {!isLoading && renderMainContent()} {/* Renderizar solo si no está cargando */}
        </main>
      </div>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;