// src/components/Header.jsx
import React, { useState } from 'react';
import { Search, Menu, Github, Save, Download, MoreVertical } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import exportImportUtils from '../utils/exportImport';

const Header = ({ searchTerm, setSearchTerm, setMobileMenuOpen }) => {
  const { 
    isGithubConnected, 
    saveDataToGitHub,
    syncStatus,
    exportDataToJson
  } = useData();
  
  // Estado para controlar el menú desplegable en móviles
  const [showDropdown, setShowDropdown] = useState(false);

  // Manejar la exportación de datos
  const handleExportData = () => {
    const jsonData = exportDataToJson();
    exportImportUtils.downloadString(
      jsonData,
      'gallos_manager_data.json',
      'application/json'
    );
    setShowDropdown(false);
  };

  // Manejar la exportación a Excel
  const handleExportExcel = () => {
    const jsonData = JSON.parse(exportDataToJson());
    const excelBlob = exportImportUtils.entitiesToExcel(jsonData);
    exportImportUtils.downloadBlob(excelBlob, 'gallos_manager_data.xlsx');
    setShowDropdown(false);
  };

  // Manejar guardado en GitHub
  const handleSaveToGithub = () => {
    saveDataToGitHub();
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-2 flex items-center justify-between md:px-6">
        {/* Botón de menú móvil */}
        <button
          className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>

        {/* Buscador */}
        <div className="relative flex-1 max-w-xl mx-4 md:mx-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Versión escritorio de acciones */}
        <div className="hidden sm:flex items-center space-x-2">
          {/* Botón para guardar en GitHub */}
          {isGithubConnected && (
            <button
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={saveDataToGitHub}
              disabled={syncStatus === 'syncing'}
            >
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Guardar en</span> 
              <Github className="h-4 w-4 ml-1" />
            </button>
          )}

          {/* Botón para exportar datos */}
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Botón para exportar a Excel */}
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleExportExcel}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>

        {/* Menú desplegable para móviles */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <MoreVertical size={20} />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
              {isGithubConnected && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={handleSaveToGithub}
                  disabled={syncStatus === 'syncing'}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar en GitHub
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleExportExcel}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;