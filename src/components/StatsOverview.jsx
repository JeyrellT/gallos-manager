import React from 'react';
import { useData } from '../contexts/DataContext';

const StatsOverview = ({ gallo }) => {
  const { peleas } = useData();

  // Filtrar peleas de este gallo específico
  const galloPeleas = peleas.filter(pelea => pelea.id_gallo === gallo.id_gallo);
  
  const calcularEstadisticasPeleas = () => {
    const totalPeleas = galloPeleas.length || 0;
    const victorias = galloPeleas.filter(p => p.resultado === 'Victoria').length || 0;
    const derrotas = galloPeleas.filter(p => p.resultado === 'Derrota').length || 0;
    const empates = galloPeleas.filter(p => p.resultado === 'Empate').length || 0;
    const porcentajeVictorias = totalPeleas > 0 ? Math.round((victorias / totalPeleas) * 100) : 0;

    return {
      totalPeleas,
      victorias,
      derrotas,
      empates,
      porcentajeVictorias
    };
  };

  const stats = calcularEstadisticasPeleas();

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-gray-700 mb-3">Estadísticas</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Total de Peleas:</span>
          <span>{stats.totalPeleas}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Victorias:</span>
          <span className="text-green-600">{stats.victorias}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Derrotas:</span>
          <span className="text-red-600">{stats.derrotas}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Empates:</span>
          <span className="text-yellow-600">{stats.empates}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-gray-500">Efectividad:</span>
          <span>{stats.porcentajeVictorias}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;