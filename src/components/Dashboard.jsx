import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Feather, Award, Heart, Activity, Wifi, WifiOff, AlertTriangle,
  Scale, Utensils, Droplet, Dumbbell, ChevronRight, PieChart, TrendingUp
} from 'lucide-react';

import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { motion } from 'framer-motion';
import GalloSelector from './GalloSelector';
import FilterPanel from './FilterPanel';
import Timeline from './Timeline';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Reusable StatCard component
const StatCard = ({ title, value, subtitle, icon, onClick, color, children }) => (
  <div 
    className={`bg-white rounded-lg shadow-sm p-6 ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-medium text-gray-700">{title}</h2>
      {React.cloneElement(icon, { className: `w-8 h-8 text-${color || 'indigo'}-500` })}
    </div>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    {children}
  </div>
);

// Componente de sección con título
const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="mb-4">
    <div className="flex items-center">
      {icon && React.cloneElement(icon, { className: "w-6 h-6 mr-2 text-indigo-600" })}
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// Componente para indicadores individuales del gallo
const GalloStatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 border-${color || 'indigo'}-400`}>
    <div className="flex items-center">
      {React.cloneElement(icon, { className: `w-5 h-5 mr-2 text-${color || 'indigo'}-500` })}
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
    </div>
    <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
  </div>
);

const Dashboard = ({ setActiveTab }) => {
  // Get all necessary data from context
  const {
    gallos,
    lineasGeneticas,
    peleas,
    cuidadosMedicos,
    entrenamientos,
    alimentacion,
    higiene,
    controlPesos,
    isGithubReady,
    storageMode
  } = useData();

  // State for selected gallo in weight trend chart
  const [selectedGalloId, setSelectedGalloId] = useState('');

  // Add new state for filters
  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    eventTypes: {
      peleas: false,
      entrenamientos: false,
      cuidadosMedicos: false,
      alimentacion: false,
      higiene: false
    }
  });

  const [eventLimit, setEventLimit] = useState(5);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Intl.DateTimeFormat('es-CR', { year: 'numeric', month: 'short', day: 'numeric' })
            .format(new Date(dateString + 'T00:00:00'));
    } catch(e) { return 'Fecha inválida'; }
  };

  // Función para calcular edad - movida aquí arriba antes de su uso
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'Desconocida';
    
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} año${years !== 1 ? 's' : ''} ${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      return `${months} mes${months !== 1 ? 'es' : ''}`;
    }
  };

  // Format time duration in hours and minutes

  // Stats calculation with useMemo to optimize performance
  const stats = useMemo(() => {
    // Basic stats (as before)
    const totalGallos = gallos.length;
    const gallosActivos = gallos.filter(g => g.estado === 'Activo').length;
    const gallosInactivos = gallos.filter(g => g.estado === 'Inactivo').length;
    const gallosLesionados = gallos.filter(g => g.estado === 'Lesionado').length;
    const gallosRetirados = gallos.filter(g => g.estado === 'Retirado').length;
    
    // Calculate average age of active gallos
    const today = new Date();
    let totalAgeInDays = 0;
    let gallosWithBirthdate = 0;
    
    gallos.filter(g => g.estado === 'Activo').forEach(gallo => {
      if (gallo.fecha_nacimiento) {
        const birthDate = new Date(gallo.fecha_nacimiento);
        const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
        totalAgeInDays += ageInDays;
        gallosWithBirthdate++;
      }
    });
    
    const avgAgeInDays = gallosWithBirthdate > 0 ? Math.round(totalAgeInDays / gallosWithBirthdate) : 0;
    const avgAgeInMonths = Math.floor(avgAgeInDays / 30);
    
    // Find most popular genetic line
    const lineaCounts = {};
    gallos.forEach(gallo => {
      if (gallo.id_linea) {
        lineaCounts[gallo.id_linea] = (lineaCounts[gallo.id_linea] || 0) + 1;
      }
    });
    
    let popularLineaId = null;
    let maxCount = 0;
    
    Object.entries(lineaCounts).forEach(([lineaId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        popularLineaId = lineaId;
      }
    });
    
    const popularLinea = lineasGeneticas.find(l => l.id_linea === popularLineaId);
    
    // Peleas stats
    const totalPeleas = peleas.length;
    const victorias = peleas.filter(p => p.resultado === 'Victoria').length;
    const derrotas = peleas.filter(p => p.resultado === 'Derrota').length;
    const empates = peleas.filter(p => p.resultado === 'Empate').length;
    
    // Calcular récord de peleas (Formato: 5V-2D-1E)
    const recordPeleas = `${victorias}V-${derrotas}D-${empates}E`;
    
    // Find gallo with best record (minimum 2 fights)
    const gallosConPeleas = {};
    peleas.forEach(pelea => {
      if (!gallosConPeleas[pelea.id_gallo]) {
        gallosConPeleas[pelea.id_gallo] = { victorias: 0, derrotas: 0, empates: 0, total: 0 };
      }
      gallosConPeleas[pelea.id_gallo].total += 1;
      
      if (pelea.resultado === 'Victoria') gallosConPeleas[pelea.id_gallo].victorias += 1;
      else if (pelea.resultado === 'Derrota') gallosConPeleas[pelea.id_gallo].derrotas += 1;
      else if (pelea.resultado === 'Empate') gallosConPeleas[pelea.id_gallo].empates += 1;
    });
    
    let mejorGallo = null;
    let mejorPorcentaje = 0;
    
    Object.entries(gallosConPeleas).forEach(([galloId, record]) => {
      if (record.total >= 2) {
        const porcentajeVictorias = (record.victorias / record.total) * 100;
        if (porcentajeVictorias > mejorPorcentaje) {
          mejorPorcentaje = porcentajeVictorias;
          mejorGallo = { 
            id: galloId, 
            porcentaje: porcentajeVictorias, 
            record: `${record.victorias}V-${record.derrotas}D-${record.empates}E` 
          };
        }
      }
    });
    
    if (mejorGallo) {
      const galloInfo = gallos.find(g => g.id_gallo === mejorGallo.id);
      if (galloInfo) {
        mejorGallo.nombre = galloInfo.nombre;
      }
    }
    
    // Recent medical cares (last 30 days)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const recentCuidados = cuidadosMedicos.filter(c => {
      const fechaCuidado = new Date(c.fecha);
      return fechaCuidado >= oneMonthAgo;
    }).length;
    
    // Most common care type
    const cuidadoTypes = {};
    cuidadosMedicos.forEach(c => {
      if (c.tipo) {
        cuidadoTypes[c.tipo] = (cuidadoTypes[c.tipo] || 0) + 1;
      }
    });
    
    let commonCareType = null;
    let maxCareCount = 0;
    
    Object.entries(cuidadoTypes).forEach(([type, count]) => {
      if (count > maxCareCount) {
        maxCareCount = count;
        commonCareType = type;
      }
    });
    
    // Training stats
    const totalEntrenamientos = entrenamientos.length;
    let totalDuracionMinutos = 0;
    
    entrenamientos.forEach(e => {
      if (e.duracion_min) {
        totalDuracionMinutos += parseInt(e.duracion_min, 10) || 0;
      }
    });
    
    // Food stats
    const alimentoTypes = {};
    alimentacion.forEach(a => {
      if (a.tipo_alimento) {
        alimentoTypes[a.tipo_alimento] = (alimentoTypes[a.tipo_alimento] || 0) + 1;
      }
    });
    
    let commonFoodType = null;
    let maxFoodCount = 0;
    
    Object.entries(alimentoTypes).forEach(([type, count]) => {
      if (count > maxFoodCount) {
        maxFoodCount = count;
        commonFoodType = type;
      }
    });
    
    // Recent week's food amount
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let totalCantidadSemana = 0;
    alimentacion.forEach(a => {
      const fechaAlimento = new Date(a.fecha);
      if (fechaAlimento >= oneWeekAgo && a.cantidad_g) {
        totalCantidadSemana += parseInt(a.cantidad_g, 10) || 0;
      }
    });
    
    // Últimos registros de higiene
    let ultimaHigiene = null;
    if (higiene.length > 0) {
      const sorted = [...higiene].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      ultimaHigiene = sorted[0];
    }
    
    // Average weight of active gallos
    let totalPeso = 0;
    let gallosConPeso = 0;
    
    // Group by gallo to get latest weight per gallo
    const pesosPorGallo = {};
    controlPesos.forEach(p => {
      if (!pesosPorGallo[p.id_gallo]) {
        pesosPorGallo[p.id_gallo] = [];
      }
      pesosPorGallo[p.id_gallo].push(p);
    });
    
    // Sort by date and get latest for each gallo
    Object.values(pesosPorGallo).forEach(pesos => {
      pesos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const latestPeso = pesos[0];
      
      const gallo = gallos.find(g => g.id_gallo === latestPeso.id_gallo);
      if (gallo && gallo.estado === 'Activo' && latestPeso.peso_g) {
        totalPeso += parseInt(latestPeso.peso_g, 10) || 0;
        gallosConPeso++;
      }
    });
    
    const avgPeso = gallosConPeso > 0 ? Math.round(totalPeso / gallosConPeso) : 0;
    
    // Recent weighed gallos (last 30 days)
    const pesoReciente = Object.values(pesosPorGallo).filter(pesos => {
      const latestPeso = pesos[0]; // Already sorted above
      const fechaPeso = new Date(latestPeso.fecha);
      return fechaPeso >= oneMonthAgo;
    }).length;
    
    // Upcoming events (next 30 days)
    const hoy = new Date();
    const proximos30Dias = new Date();
    proximos30Dias.setDate(proximos30Dias.getDate() + 30);
    
    const proximosCuidados = cuidadosMedicos
      .filter(c => {
        const fechaCuidado = new Date(c.fecha + 'T00:00:00');
        return fechaCuidado >= hoy && fechaCuidado <= proximos30Dias;
      })
      .map(c => ({
        tipo: 'Cuidado Médico',
        descripcion: c.descripcion,
        fecha: c.fecha,
        gallo: gallos.find(g => g.id_gallo === c.id_gallo) || {},
        id: `c-${c.id_cuidado}`
      }));
    
    const proximosEntrenamientos = entrenamientos
      .filter(e => {
        const fechaEntrenamiento = new Date(e.fecha + 'T00:00:00');
        return fechaEntrenamiento >= hoy && fechaEntrenamiento <= proximos30Dias;
      })
      .map(e => ({
        tipo: 'Entrenamiento',
        descripcion: e.tipo,
        fecha: e.fecha,
        gallo: gallos.find(g => g.id_gallo === e.id_gallo) || {},
        id: `e-${e.id_entrenamiento}`
      }));
    
    const proximosEventos = [...proximosCuidados, ...proximosEntrenamientos]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 5);
    
    // Get gallos that need attention (injured or no recent activities)
    const gallosLesionadosLista = gallos
      .filter(g => g.estado === 'Lesionado')
      .map(g => ({ ...g, razon: 'Lesionado' }));
    
    const gallosInactividadList = gallos
      .filter(g => {
        if (g.estado !== 'Activo') return false;
        
        // Check if gallo has any recent activity (last 30 days)
        const tienePesoReciente = controlPesos.some(p => {
          return p.id_gallo === g.id_gallo && new Date(p.fecha) >= oneMonthAgo;
        });
        
        const tieneCuidadoReciente = cuidadosMedicos.some(c => {
          return c.id_gallo === g.id_gallo && new Date(c.fecha) >= oneMonthAgo;
        });
        
        const tieneEntrenamientoReciente = entrenamientos.some(e => {
          return e.id_gallo === g.id_gallo && new Date(e.fecha) >= oneMonthAgo;
        });
        
        return !tienePesoReciente && !tieneCuidadoReciente && !tieneEntrenamientoReciente;
      })
      .map(g => ({ ...g, razon: 'Sin actividad en 30 días' }));
    
    const gallosAtencion = [...gallosLesionadosLista, ...gallosInactividadList].slice(0, 5);
    
    return {
      totalGallos,
      gallosActivos,
      gallosInactivos,
      gallosLesionados,
      gallosRetirados,
      avgAgeInDays,
      avgAgeInMonths,
      popularLinea: popularLinea ? popularLinea.nombre_linea : 'N/A',
      totalPeleas,
      victorias,
      derrotas,
      empates,
      recordPeleas,
      mejorGallo,
      totalCuidados: cuidadosMedicos.length,
      recentCuidados,
      commonCareType,
      totalEntrenamientos,
      totalDuracionMinutos,
      commonFoodType,
      totalCantidadSemana,
      ultimaHigiene,
      avgPeso,
      pesoReciente,
      proximosEventos,
      gallosAtencion
    };
  }, [gallos, lineasGeneticas, peleas, cuidadosMedicos, entrenamientos, alimentacion, higiene, controlPesos]);

  // Chart data for Gallos by status
  const galloStatusChartData = {
    labels: ['Activos', 'Inactivos', 'Lesionados', 'Retirados'],
    datasets: [
      {
        data: [stats.gallosActivos, stats.gallosInactivos, stats.gallosLesionados, stats.gallosRetirados],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for Peleas results
  const peleasResultsChartData = {
    labels: ['Victorias', 'Derrotas', 'Empates'],
    datasets: [
      {
        label: 'Resultados',
        data: [stats.victorias, stats.derrotas, stats.empates],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      },
    ],
  };

  // Weight trend chart data (for a specific gallo)
  const weightTrendData = useMemo(() => {
    if (!selectedGalloId) {
      // If no gallo selected, use the one with most weight records
      const pesosPorGallo = {};
      controlPesos.forEach(p => {
        pesosPorGallo[p.id_gallo] = (pesosPorGallo[p.id_gallo] || 0) + 1;
      });
      
      let maxRecords = 0;
      let galloWithMostRecords = null;
      
      Object.entries(pesosPorGallo).forEach(([galloId, count]) => {
        if (count > maxRecords) {
          maxRecords = count;
          galloWithMostRecords = galloId;
        }
      });
      
      if (galloWithMostRecords) {
        setSelectedGalloId(galloWithMostRecords);
      } else {
        return null; // No hay registros de peso
      }
    }
    
    // Get weight records for the selected gallo
    const galloWeights = controlPesos
      .filter(p => p.id_gallo === selectedGalloId)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    if (galloWeights.length === 0) return null;
    
    // Get gallo name
    const galloName = gallos.find(g => g.id_gallo === selectedGalloId)?.nombre || 'Desconocido';
    
    return {
      labels: galloWeights.map(w => {
        const date = new Date(w.fecha);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          label: `Peso de ${galloName} (g)`,
          data: galloWeights.map(w => w.peso_g),
          fill: false,
          borderColor: '#6366F1',
          tension: 0.1,
        },
      ],
    };
  }, [selectedGalloId, controlPesos, gallos]);

  // Generate options for gallo selector

  // Recent activity chart data

  // Data for the calendar visualization

  // Stats específicas del gallo seleccionado
  const selectedGalloStats = useMemo(() => {
    if (!selectedGalloId) return null;
    
    const gallo = gallos.find(g => g.id_gallo === selectedGalloId);
    if (!gallo) return null;
    
    // Entrenamientos recientes (últimos 30 días)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const recentEntrenamientos = entrenamientos
      .filter(e => e.id_gallo === selectedGalloId && new Date(e.fecha) >= oneMonthAgo)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Último registro de peso
    const pesosByGallo = controlPesos
      .filter(p => p.id_gallo === selectedGalloId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const ultimoPeso = pesosByGallo.length > 0 ? pesosByGallo[0] : null;
    
    // Último registro de alimentación
    const alimentacionByGallo = alimentacion
      .filter(a => a.id_gallo === selectedGalloId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const ultimaAlimentacion = alimentacionByGallo.length > 0 ? alimentacionByGallo[0] : null;
    
    // Último registro de higiene
    const higieneByGallo = higiene
      .filter(h => h.id_gallo === selectedGalloId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const ultimaHigieneGallo = higieneByGallo.length > 0 ? higieneByGallo[0] : null;
    
    // Peleas del gallo
    const peleasByGallo = peleas
      .filter(p => p.id_gallo === selectedGalloId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const victorias = peleasByGallo.filter(p => p.resultado === 'Victoria').length;
    const derrotas = peleasByGallo.filter(p => p.resultado === 'Derrota').length;
    const empates = peleasByGallo.filter(p => p.resultado === 'Empate').length;
    
    const recordGallo = `${victorias}V-${derrotas}D-${empates}E`;
    const ultimaPelea = peleasByGallo.length > 0 ? peleasByGallo[0] : null;
    
    // Eventos próximos del gallo (30 días hacia adelante)
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    
    // Combina todos los eventos próximos
    const proximosCuidados = cuidadosMedicos
      .filter(c => {
        return c.id_gallo === selectedGalloId && 
               new Date(c.fecha) >= today && 
               new Date(c.fecha) <= next30Days;
      })
      .map(c => ({
        tipo: 'Cuidado Médico',
        fecha: c.fecha,
        descripcion: c.descripcion || c.tipo
      }));
    
    const proximosEntrenamientos = entrenamientos
      .filter(e => {
        return e.id_gallo === selectedGalloId && 
               new Date(e.fecha) >= today && 
               new Date(e.fecha) <= next30Days;
      })
      .map(e => ({
        tipo: 'Entrenamiento',
        fecha: e.fecha,
        descripcion: e.tipo || 'Entrenamiento programado'
      }));
    
    const proximosEventos = [...proximosCuidados, ...proximosEntrenamientos]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    // Calcula la tendencia del peso (últimos 3 meses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const pesosTrimestre = controlPesos
      .filter(p => p.id_gallo === selectedGalloId && new Date(p.fecha) >= threeMonthsAgo)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let tendenciaPeso = 'Estable';
    
    if (pesosTrimestre.length >= 2) {
      const firstWeight = parseInt(pesosTrimestre[0].peso_g, 10);
      const lastWeight = parseInt(pesosTrimestre[pesosTrimestre.length - 1].peso_g, 10);
      
      // Calcula la diferencia porcentual
      const diffPercent = ((lastWeight - firstWeight) / firstWeight) * 100;
      
      if (diffPercent > 5) {
        tendenciaPeso = 'Aumento';
      } else if (diffPercent < -5) {
        tendenciaPeso = 'Disminución';
      }
    }
    
    return {
      nombre: gallo.nombre,
      estado: gallo.estado,
      raza: gallo.raza,
      edad: gallo.fecha_nacimiento ? calcularEdad(gallo.fecha_nacimiento) : 'Desconocida',
      recentEntrenamientos,
      ultimoPeso,
      ultimaAlimentacion,
      ultimaHigieneGallo,
      recordGallo,
      ultimaPelea,
      proximosEventos,
      tendenciaPeso,
      pesosTrimestre
    };
  }, [selectedGalloId, gallos, entrenamientos, controlPesos, alimentacion, higiene, peleas, cuidadosMedicos]);

  const renderStorageModeInfo = () => {
    if (storageMode === 'github') {
      if (isGithubReady) {
        return (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-md flex items-center space-x-3">
            <Wifi size={20} className="text-green-600"/>
            <div>
              <p className="text-sm font-medium text-green-800">Modo Online: Sincronización con GitHub activa.</p>
              <p className="text-xs text-green-700">Los cambios se guardan localmente y en GitHub.</p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md flex items-center space-x-3">
            <AlertTriangle size={20} className="text-yellow-600"/>
            <div>
              <p className="text-sm font-medium text-yellow-800">Modo Online seleccionado, pero requiere configuración.</p>
              <button onClick={() => setActiveTab('settings')} className="text-xs text-indigo-600 hover:underline">Ir a Configuración para conectar.</button>
            </div>
          </div>
        );
      }
    } else { // storageMode === 'local'
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md flex items-center space-x-3">
          <WifiOff size={20} className="text-blue-600"/>
          <div>
            <p className="text-sm font-medium text-blue-800">Modo Offline: Trabajando solo con datos locales.</p>
            {isGithubReady && (
              <button onClick={() => setActiveTab('settings')} className="text-xs text-indigo-600 hover:underline">Ir a Configuración para activar sincronización.</button>
            )}
          </div>
        </div>
      );
    }
  };

  // Combine all events for timeline
  const allEvents = useMemo(() => {
    const events = [];
    
    // Add peleas
    events.push(...peleas.map(p => ({
      ...p,
      tipo: 'Pelea',
      descripcion: `Pelea - ${p.resultado}`,
      gallo: gallos.find(g => g.id_gallo === p.id_gallo)
    })));

    // Add entrenamientos
    events.push(...entrenamientos.map(e => ({
      ...e,
      tipo: 'Entrenamiento',
      descripcion: e.tipo || 'Entrenamiento',
      gallo: gallos.find(g => g.id_gallo === e.id_gallo)
    })));

    // Add cuidados médicos
    events.push(...cuidadosMedicos.map(c => ({
      ...c,
      tipo: 'Cuidado Médico',
      descripcion: c.descripcion || c.tipo,
      gallo: gallos.find(g => g.id_gallo === c.id_gallo)
    })));

    // Add higiene
    events.push(...higiene.map(h => ({
      ...h,
      tipo: 'Higiene',
      descripcion: h.descripcion || 'Limpieza',
      gallo: gallos.find(g => g.id_gallo === h.id_gallo)
    })));

    // Filter events based on date range, event types, and selected gallo
    return events
      .filter(event => {
        const eventDate = new Date(event.fecha);
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        // Filter by date range
        if (start && eventDate < start) return false;
        if (end && eventDate > end) return false;

        // Filter by selected gallo if we're in the individual view
        if (selectedGalloId && event.id_gallo !== selectedGalloId) return false;

        // Filter by event type
        const typeKey = event.tipo.toLowerCase().replace(' ', '');
        if (Object.values(filters.eventTypes).some(v => v)) {
          return filters.eventTypes[typeKey];
        }
        return true;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [gallos, peleas, entrenamientos, cuidadosMedicos, higiene, filters, selectedGalloId]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {renderStorageModeInfo()}
      </div>

      {/* SECCIÓN 1: INFORMACIÓN GENERAL (VISTA GLOBAL) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <SectionTitle 
          icon={<PieChart />} 
          title="Información General" 
          subtitle="Resumen global de todos los gallos registrados" 
        />

        {/* Indicadores clave en tarjetas superiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Tarjeta de Total de Gallos */}
          <StatCard 
            title="Total de Gallos" 
            value={stats.totalGallos}
            subtitle={`${stats.gallosActivos} activos (${Math.round((stats.gallosActivos / (stats.totalGallos || 1)) * 100)}%)`}
            icon={<Feather />}
            color="blue"
            onClick={() => setActiveTab('gallos')}
          />
          
          {/* Tarjeta de Líneas Genéticas */}
          <StatCard 
            title="Líneas Genéticas" 
            value={lineasGeneticas.length}
            subtitle={`Línea más común: ${stats.popularLinea}`}
            icon={<Activity />}
            color="indigo"
            onClick={() => setActiveTab('lineasGeneticas')}
          />
          
          {/* Tarjeta de Peleas */}
          <StatCard 
            title="Peleas" 
            value={stats.totalPeleas}
            subtitle={`Récord: ${stats.recordPeleas}`}
            icon={<Award />}
            color="blue"
            onClick={() => setActiveTab('peleas')}
          />
          
          {/* Tarjeta de Cuidados Médicos */}
          <StatCard 
            title="Cuidados Médicos" 
            value={stats.totalCuidados}
            subtitle={`${stats.recentCuidados} en últimos 30 días`}
            icon={<Heart />}
            color="indigo"
            onClick={() => setActiveTab('cuidadosMedicos')}
          />
        </div>

        {/* Gráficos generales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Estado de Gallos (Pie chart) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Estado General de Gallos</h3>
            <div className="h-64">
              <Pie 
                data={galloStatusChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          {/* Gráfico de Resultados de Peleas (Barras) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Resultados Generales de Peleas</h3>
            <div className="h-64">
              <Bar 
                data={peleasResultsChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: INFORMACIÓN INDIVIDUAL (VISTA DETALLADA) */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
        <SectionTitle 
          icon={<TrendingUp />} 
          title="Análisis Individual" 
          subtitle="Información detallada por gallo" 
        />

        {/* Selector de gallo individual */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Seleccionar Gallo</h3>
          <GalloSelector
            gallos={gallos}
            selectedGalloId={selectedGalloId}
            onSelectGallo={(id) => {
              setSelectedGalloId(id);
            }}
          />
        </div>

        {selectedGalloId && selectedGalloStats ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tarjetas con información del gallo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Entrenamientos recientes */}
              <GalloStatCard
                title="Entrenamientos Recientes"
                value={selectedGalloStats.recentEntrenamientos.length > 0 
                  ? `${selectedGalloStats.recentEntrenamientos.length} en 30 días` 
                  : 'Sin entrenamientos recientes'}
                icon={<Dumbbell />}
                color="green"
              />
              
              {/* Alimentación */}
              <GalloStatCard
                title="Alimentación"
                value={selectedGalloStats.ultimaAlimentacion 
                  ? `${selectedGalloStats.ultimaAlimentacion.tipo_alimento || 'Alimento'} - ${selectedGalloStats.ultimaAlimentacion.cantidad_g}g` 
                  : 'Sin registros'}
                icon={<Utensils />}
                color="orange"
              />
              
              {/* Higiene */}
              <GalloStatCard
                title="Higiene"
                value={selectedGalloStats.ultimaHigieneGallo 
                  ? formatDate(selectedGalloStats.ultimaHigieneGallo.fecha) 
                  : 'Sin registros'}
                icon={<Droplet />}
                color="blue"
              />
              
              {/* Control de peso */}
              <GalloStatCard
                title="Último Control de Peso"
                value={selectedGalloStats.ultimoPeso 
                  ? `${selectedGalloStats.ultimoPeso.peso_g}g (${formatDate(selectedGalloStats.ultimoPeso.fecha)})` 
                  : 'Sin registros'}
                icon={<Scale />}
                color="purple"
              />
            </div>

            {/* Gráfico de tendencia de peso */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Tendencia de Peso - {selectedGalloStats.nombre}
              </h3>
              <div className="h-64">
                {weightTrendData ? (
                  <Line 
                    data={weightTrendData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        zoom: {
                          pan: {
                            enabled: true,
                            mode: 'x'
                          },
                          zoom: {
                            wheel: {
                              enabled: true,
                            },
                            pinch: {
                              enabled: true
                            },
                            mode: 'x',
                          }
                        }
                      },
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: 'Peso (g)'
                          }
                        }
                      }
                    }} 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No hay suficientes datos de peso para mostrar una tendencia
                  </div>
                )}
              </div>
            </div>

            {/* Resultados individuales de peleas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Panel de resultados */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Resultados Individuales de Peleas
                </h3>
                {selectedGalloStats.ultimaPelea ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Récord:</span>
                        <span className="text-lg font-bold text-gray-800">{selectedGalloStats.recordGallo}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mt-2">
                        {peleas.filter(p => p.id_gallo === selectedGalloId).length > 0 && (
                          <>
                            <div 
                              className="h-full bg-green-500 rounded-l-full" 
                              style={{ 
                                width: `${(peleas.filter(p => p.id_gallo === selectedGalloId && p.resultado === 'Victoria').length / 
                                peleas.filter(p => p.id_gallo === selectedGalloId).length) * 100}%`,
                                display: 'inline-block'
                              }}
                            ></div>
                            <div 
                              className="h-full bg-yellow-500" 
                              style={{ 
                                width: `${(peleas.filter(p => p.id_gallo === selectedGalloId && p.resultado === 'Empate').length / 
                                peleas.filter(p => p.id_gallo === selectedGalloId).length) * 100}%`,
                                display: 'inline-block'
                              }}
                            ></div>
                            <div 
                              className="h-full bg-red-500 rounded-r-full" 
                              style={{ 
                                width: `${(peleas.filter(p => p.id_gallo === selectedGalloId && p.resultado === 'Derrota').length / 
                                peleas.filter(p => p.id_gallo === selectedGalloId).length) * 100}%`,
                                display: 'inline-block'
                              }}
                            ></div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-700">Última Pelea</h4>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fecha:</span>
                          <span className="font-medium">{formatDate(selectedGalloStats.ultimaPelea.fecha)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Resultado:</span>
                          <span className={`font-medium ${
                            selectedGalloStats.ultimaPelea.resultado === 'Victoria' ? 'text-green-600' :
                            selectedGalloStats.ultimaPelea.resultado === 'Derrota' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {selectedGalloStats.ultimaPelea.resultado}
                          </span>
                        </div>
                        {selectedGalloStats.ultimaPelea.peso_pelea_g && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Peso:</span>
                            <span className="font-medium">{selectedGalloStats.ultimaPelea.peso_pelea_g}g</span>
                          </div>
                        )}
                        {selectedGalloStats.ultimaPelea.rival && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Rival:</span>
                            <span className="font-medium">{selectedGalloStats.ultimaPelea.rival}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('peleas')}
                      className="mt-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Ver todas las peleas <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay registros de peleas para este gallo
                  </div>
                )}
              </div>
              
              {/* Próximos eventos y alertas */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Alertas y Próximos Eventos
                </h3>
                
                {/* Estado y alertas */}
                <div className={`p-3 rounded-lg mb-4 ${
                  selectedGalloStats.estado === 'Activo' ? 'bg-green-50 text-green-800' :
                  selectedGalloStats.estado === 'Lesionado' ? 'bg-red-50 text-red-800' :
                  'bg-yellow-50 text-yellow-800'
                }`}>
                  <div className="font-medium">Estado: {selectedGalloStats.estado}</div>
                  <div className="text-sm mt-1">
                    {selectedGalloStats.estado === 'Lesionado' ? 
                      'Este gallo requiere atención médica' : 
                      selectedGalloStats.estado === 'Inactivo' ? 
                      'Este gallo no está participando actualmente' :
                      'Este gallo está disponible para actividades'}
                  </div>
                </div>
                
                {/* Próximos eventos */}
                {selectedGalloStats.proximosEventos.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Próximos eventos</h4>
                    <div className="space-y-2">
                      {selectedGalloStats.proximosEventos.slice(0, 3).map((evento, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex justify-between">
                            <div>
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                evento.tipo === 'Cuidado Médico' ? 'bg-red-500' : 'bg-green-500'
                              }`}></span>
                              {evento.tipo}
                            </div>
                            <div className="font-medium">{formatDate(evento.fecha)}</div>
                          </div>
                          <div className="mt-1 text-gray-600">{evento.descripcion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay eventos próximos para este gallo
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">Selecciona un gallo para ver información detallada</p>
          </div>
        )}
      </div>

      {/* Línea de tiempo general */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Línea de Tiempo General</h3>
        {/* Filter panel for timeline */}
        <FilterPanel filters={filters} setFilters={setFilters} />
        <Timeline events={allEvents.slice(0, eventLimit)} />
        {allEvents.length > eventLimit && (
          <div className="mt-3 text-center">
            <button 
              className="text-sm text-indigo-600 hover:underline inline-flex items-center"
              onClick={() => setEventLimit(prev => prev + 5)}
            >
              Ver más eventos <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;