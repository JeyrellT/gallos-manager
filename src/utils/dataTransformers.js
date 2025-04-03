// src/utils/dataTransformers.js

/**
 * Utilidades para transformar y formatear datos entre diferentes formatos
 * y estructuras en la aplicación.
 */

/**
 * Transforma datos de gallo para mostrar en el dashboard o listas
 * @param {Object} gallo - Datos crudos del gallo
 * @param {Array} lineasGeneticas - Lista de líneas genéticas
 * @returns {Object} - Datos transformados con información adicional
 */
export const transformGalloData = (gallo, lineasGeneticas = []) => {
    if (!gallo) return null;
    
    // Encontrar la línea genética asociada
    const lineaGenetica = lineasGeneticas.find(l => l.id_linea === gallo.id_linea);
    
    // Calcular edad
    let edad = 'Desconocida';
    if (gallo.fecha_nacimiento) {
      const fechaNacimiento = new Date(gallo.fecha_nacimiento);
      const hoy = new Date();
      
      let años = hoy.getFullYear() - fechaNacimiento.getFullYear();
      let meses = hoy.getMonth() - fechaNacimiento.getMonth();
      
      if (meses < 0) {
        años--;
        meses += 12;
      }
      
      edad = `${años} años, ${meses} meses`;
    }
    
    return {
      ...gallo,
      lineaGenetica: lineaGenetica ? lineaGenetica.nombre_linea : 'Desconocida',
      edad,
      pesoFormateado: gallo.peso_actual ? `${gallo.peso_actual} g` : 'No registrado',
      fechaFormateada: gallo.fecha_nacimiento ? formatDate(gallo.fecha_nacimiento) : 'Desconocida'
    };
  };
  
  /**
   * Transforma datos de peleas para análisis y estadísticas
   * @param {Array} peleas - Lista de peleas
   * @param {string} galloId - ID del gallo (opcional, para filtrar por gallo)
   * @returns {Object} - Estadísticas y datos transformados
   */
  export const transformPeleasData = (peleas = [], galloId = null) => {
    // Filtrar por gallo si se proporciona ID
    const peleasFiltradas = galloId 
      ? peleas.filter(p => p.id_gallo === galloId)
      : peleas;
    
    // Estadísticas generales
    const totalPeleas = peleasFiltradas.length;
    const victorias = peleasFiltradas.filter(p => p.resultado === 'Victoria').length;
    const derrotas = peleasFiltradas.filter(p => p.resultado === 'Derrota').length;
    const empates = peleasFiltradas.filter(p => p.resultado === 'Empate').length;
    
    // Cálculos adicionales
    const porcentajeVictorias = totalPeleas > 0 ? (victorias / totalPeleas) * 100 : 0;
    
    // Ordenar por fecha
    const peleasOrdenadas = [...peleasFiltradas].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    
    // Datos para gráficos
    const datosMensuales = obtenerDatosMensuales(peleasFiltradas);
    
    return {
      totalPeleas,
      victorias,
      derrotas,
      empates,
      porcentajeVictorias: porcentajeVictorias.toFixed(1),
      peleasRecientes: peleasOrdenadas.slice(0, 5),
      datosMensuales
    };
  };
  
  /**
   * Agrupa peleas por mes para análisis de tendencias
   * @param {Array} peleas - Lista de peleas
   * @returns {Array} - Datos agrupados por mes
   */
  const obtenerDatosMensuales = (peleas) => {
    const datosPorMes = {};
    
    peleas.forEach(pelea => {
      if (!pelea.fecha) return;
      
      const fecha = new Date(pelea.fecha);
      const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!datosPorMes[mesAño]) {
        datosPorMes[mesAño] = {
          mes: mesAño,
          total: 0,
          victorias: 0,
          derrotas: 0,
          empates: 0
        };
      }
      
      datosPorMes[mesAño].total++;
      
      if (pelea.resultado === 'Victoria') {
        datosPorMes[mesAño].victorias++;
      } else if (pelea.resultado === 'Derrota') {
        datosPorMes[mesAño].derrotas++;
      } else if (pelea.resultado === 'Empate') {
        datosPorMes[mesAño].empates++;
      }
    });
    
    // Convertir a array y ordenar por fecha
    return Object.values(datosPorMes).sort((a, b) => a.mes.localeCompare(b.mes));
  };
  
  /**
   * Formatea una fecha para mostrar
   * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
   * @returns {string} - Fecha formateada
   */
  export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };
  
  /**
   * Transforma datos para exportación a CSV/Excel
   * @param {Array} data - Datos a transformar
   * @param {string} entityType - Tipo de entidad
   * @returns {Array} - Datos transformados para exportación
   */
  export const transformDataForExport = (data, entityType) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Transformaciones específicas según el tipo de entidad
    switch (entityType) {
      case 'Gallo':
        return data.map(gallo => ({
          ID: gallo.id_gallo,
          Nombre: gallo.nombre,
          Raza: gallo.raza,
          'Peso (g)': gallo.peso_actual,
          Estado: gallo.estado,
          'Fecha Nacimiento': gallo.fecha_nacimiento,
          Sexo: gallo.sexo,
          'ID Línea Genética': gallo.id_linea
        }));
        
      case 'Peleas':
        return data.map(pelea => ({
          ID: pelea.id_pelea,
          'ID Gallo': pelea.id_gallo,
          Fecha: pelea.fecha,
          Resultado: pelea.resultado,
          'Duración (min)': pelea.duracion_min,
          'Peso antes (g)': pelea.peso_antes,
          'Peso después (g)': pelea.peso_despues,
          Observaciones: pelea.observaciones || ''
        }));
        
      // Más transformaciones para otros tipos de entidades...
      
      default:
        return data;
    }
  };
  
  /**
   * Transforma datos de importación a formato interno
   * @param {Array} data - Datos importados
   * @param {string} entityType - Tipo de entidad
   * @returns {Array} - Datos transformados al formato interno
   */
  export const transformImportedData = (data, entityType) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Transformaciones específicas según el tipo de entidad
    switch (entityType) {
      case 'Gallo':
        return data.map(item => ({
          id_gallo: item.ID || item.id_gallo || Date.now().toString() + Math.random().toString(36).substr(2, 5),
          nombre: item.Nombre || item.nombre || '',
          raza: item.Raza || item.raza || '',
          peso_actual: parseFloat(item['Peso (g)'] || item.peso_actual) || null,
          estado: item.Estado || item.estado || 'Activo',
          fecha_nacimiento: item['Fecha Nacimiento'] || item.fecha_nacimiento || null,
          sexo: item.Sexo || item.sexo || 'Macho',
          id_linea: item['ID Línea Genética'] || item.id_linea || null
        }));
        
      // Más transformaciones para otros tipos de entidades...
      
      default:
        return data;
    }
  };
  
  /**
   * Calcular próximos eventos (cuidados médicos y entrenamientos)
   * @param {Array} cuidadosMedicos - Lista de cuidados médicos
   * @param {Array} entrenamientos - Lista de entrenamientos
   * @param {Array} gallos - Lista de gallos
   * @param {number} diasFuturos - Número de días a considerar
   * @returns {Array} - Lista de eventos ordenados por fecha
   */
  export const calcularProximosEventos = (cuidadosMedicos = [], entrenamientos = [], gallos = [], diasFuturos = 30) => {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasFuturos);
    
    // Filtrar cuidados médicos próximos
    const proximosCuidados = cuidadosMedicos
      .filter(c => {
        const fechaCuidado = new Date(c.fecha);
        return fechaCuidado >= hoy && fechaCuidado <= fechaLimite;
      })
      .map(c => {
        const gallo = gallos.find(g => g.id_gallo === c.id_gallo);
        return {
          tipo: 'Cuidado Médico',
          subtipo: c.tipo,
          descripcion: c.descripcion,
          fecha: c.fecha,
          gallo: gallo ? gallo.nombre : 'Desconocido',
          id: c.id_cuidado,
          entidad: 'Cuidados_Medicos'
        };
      });
    
    // Filtrar entrenamientos próximos
    const proximosEntrenamientos = entrenamientos
      .filter(e => {
        const fechaEntrenamiento = new Date(e.fecha);
        return fechaEntrenamiento >= hoy && fechaEntrenamiento <= fechaLimite;
      })
      .map(e => {
        const gallo = gallos.find(g => g.id_gallo === e.id_gallo);
        return {
          tipo: 'Entrenamiento',
          subtipo: e.tipo,
          descripcion: `${e.tipo} - ${e.intensidad || 'Intensidad no especificada'}`,
          fecha: e.fecha,
          gallo: gallo ? gallo.nombre : 'Desconocido',
          id: e.id_entrenamiento,
          entidad: 'Entrenamientos'
        };
      });
    
    // Combinar y ordenar eventos por fecha
    return [...proximosCuidados, ...proximosEntrenamientos]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };