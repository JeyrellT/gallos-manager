import React from 'react';
import { Award, Heart, Activity, Utensils, Droplets, Scale } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const RelatedDataTabs = ({ gallo, activeTab, setActiveTab, showAddForm, setShowAddForm }) => {
  const { 
    peleas, 
    cuidadosMedicos,
    entrenamientos,
    alimentacion,
    higiene,
    controlPesos
  } = useData();

  // Filtrar datos relacionados con este gallo específico
  const galloId = gallo.id_gallo;
  const galloPeleas = peleas.filter(pelea => pelea.id_gallo === galloId);
  const galloCuidados = cuidadosMedicos.filter(cuidado => cuidado.id_gallo === galloId);
  const galloEntrenamientos = entrenamientos.filter(entrenamiento => entrenamiento.id_gallo === galloId);
  const galloAlimentacion = alimentacion.filter(alimento => alimento.id_gallo === galloId);
  const galloHigiene = higiene.filter(item => item.id_gallo === galloId);
  const galloPesos = controlPesos.filter(peso => peso.id_gallo === galloId);

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex overflow-x-auto">
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'peleas'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setActiveTab('peleas');
              setShowAddForm(false);
            }}
          >
            <Award className="inline-block mr-1 h-4 w-4" />
            Peleas
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'cuidados'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setActiveTab('cuidados');
              setShowAddForm(false);
            }}
          >
            <Heart className="inline-block mr-1 h-4 w-4" />
            Cuidados Médicos
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'entrenamientos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setActiveTab('entrenamientos');
              setShowAddForm(false);
            }}
          >
            <Activity className="inline-block mr-1 h-4 w-4" />
            Entrenamientos
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'alimentacion'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setActiveTab('alimentacion');
              setShowAddForm(false);
            }}
          >
            <Utensils className="inline-block mr-1 h-4 w-4" />
            Alimentación
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'higiene'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setActiveTab('higiene');
              setShowAddForm(false);
            }}
          >
            <Droplets className="inline-block mr-1 h-4 w-4" />
            Higiene
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'pesos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setActiveTab('pesos');
              setShowAddForm(false);
            }}
          >
            <Scale className="inline-block mr-1 h-4 w-4" />
            Control de Peso
          </button>
        </nav>
      </div>
      <div className="p-6">
        {/* Render tab content dynamically based on activeTab */}
        {activeTab === 'peleas' && (
          <div className="overflow-x-auto">
            {galloPeleas.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oponente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {galloPeleas.map(pelea => (
                    <tr key={pelea.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(pelea.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pelea.oponente || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pelea.resultado === 'Victoria' ? 'bg-green-100 text-green-800' : 
                          pelea.resultado === 'Derrota' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pelea.resultado || 'No registrado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pelea.notas || 'Sin notas'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros de peleas para este gallo</div>
            )}
          </div>
        )}

        {activeTab === 'cuidados' && (
          <div className="overflow-x-auto">
            {galloCuidados.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {galloCuidados.map(cuidado => (
                    <tr key={cuidado.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(cuidado.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cuidado.tipo || 'No especificado'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{cuidado.descripcion || 'Sin descripción'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros de cuidados médicos para este gallo</div>
            )}
          </div>
        )}

        {activeTab === 'entrenamientos' && (
          <div className="overflow-x-auto">
            {galloEntrenamientos.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {galloEntrenamientos.map(entrenamiento => (
                    <tr key={entrenamiento.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(entrenamiento.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrenamiento.tipo || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrenamiento.duracion || 'No especificado'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entrenamiento.notas || 'Sin notas'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros de entrenamientos para este gallo</div>
            )}
          </div>
        )}

        {activeTab === 'alimentacion' && (
          <div className="overflow-x-auto">
            {galloAlimentacion.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {galloAlimentacion.map(alimento => (
                    <tr key={alimento.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(alimento.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alimento.tipo || 'No especificado'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alimento.cantidad || 'No especificado'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{alimento.notas || 'Sin notas'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros de alimentación para este gallo</div>
            )}
          </div>
        )}

        {activeTab === 'higiene' && (
          <div className="overflow-x-auto">
            {galloHigiene.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {galloHigiene.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tipo || 'No especificado'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.notas || 'Sin notas'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros de higiene para este gallo</div>
            )}
          </div>
        )}

        {activeTab === 'pesos' && (
          <div className="overflow-x-auto">
            {galloPesos.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (g)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {galloPesos.map(peso => (
                    <tr key={peso.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(peso.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peso.peso || 'No registrado'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{peso.notas || 'Sin notas'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay registros de control de peso para este gallo</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedDataTabs;