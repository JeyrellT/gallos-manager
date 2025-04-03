// src/components/GalloDetail.jsx
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import GalloHeader from './GalloHeader';
import InfoCard from './InfoCard';
import StatsOverview from './StatsOverview';
import RelatedDataTabs from './RelatedDataTabs';
import AddRecordModal from './AddRecordModal';
import GalloForm from './GalloForm';

const GalloDetail = ({ gallo, onBack }) => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('peleas');
  const [showAddForm, setShowAddForm] = useState(false);
  const { updateData, gallos, lineasGeneticas, showNotification } = useData();

  const handleEdit = () => setEditing(true);

  const handleEditSubmit = (formData) => {
    const updatedGallos = gallos.map(g => 
      g.id_gallo === gallo.id_gallo 
        ? { ...g, ...formData } 
        : g
    );
    
    updateData('Gallo', updatedGallos);
    setEditing(false);
    showNotification('Gallo actualizado correctamente');
  };

  const handleDelete = () => {
    if (window.confirm('¿Está seguro de que desea eliminar este gallo?')) {
      const updatedGallos = gallos.filter(g => g.id_gallo !== gallo.id_gallo);
      updateData('Gallo', updatedGallos);
      showNotification('Gallo eliminado correctamente');
      onBack();
    }
  };

  if (editing) {
    return (
      <GalloForm
        initialData={gallo}
        lineasGeneticas={lineasGeneticas}
        onSubmit={handleEditSubmit}
        onCancel={() => setEditing(false)}
        isEditing={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GalloHeader gallo={gallo} onBack={onBack} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Info and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard gallo={gallo} />
        <StatsOverview gallo={gallo} />
      </div>

      {/* Related Data Tabs */}
      <RelatedDataTabs 
        gallo={gallo} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        showAddForm={showAddForm} 
        setShowAddForm={setShowAddForm} 
      />

      {/* Add Record Modal */}
      {showAddForm && (
        <AddRecordModal 
          activeTab={activeTab} 
          gallo={gallo} 
          onClose={() => setShowAddForm(false)} 
        />
      )}
    </div>
  );
};

export default GalloDetail;