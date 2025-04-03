// src/components/Notification.jsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react';

const Notification = ({ message, type = 'success' }) => {
  const [visible, setVisible] = useState(true);
  
  // Auto-ocultar la notificación después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Si no es visible, no renderizar nada
  if (!visible) return null;
  
  // Determinar ícono y colores según el tipo
  let Icon, bgColor, textColor, borderColor;
  
  switch (type) {
    case 'success':
      Icon = CheckCircle;
      bgColor = 'bg-green-50';
      textColor = 'text-green-800';
      borderColor = 'border-green-400';
      break;
    case 'error':
      Icon = AlertCircle;
      bgColor = 'bg-red-50';
      textColor = 'text-red-800';
      borderColor = 'border-red-400';
      break;
    case 'warning':
      Icon = AlertCircle;
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-400';
      break;
    case 'info':
    default:
      Icon = Info;
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-400';
      break;
  }
  
  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-md shadow-lg ${bgColor} border-l-4 ${borderColor}`}
      role="alert"
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${textColor}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
              onClick={() => setVisible(false)}
              aria-label="Cerrar notificación"
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;