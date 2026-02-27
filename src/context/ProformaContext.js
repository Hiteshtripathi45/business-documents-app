import React, { createContext, useState, useContext, useEffect } from 'react';

const ProformaContext = createContext();

export const useProformas = () => {
  const context = useContext(ProformaContext);
  if (!context) {
    throw new Error('useProformas must be used within a ProformaProvider');
  }
  return context;
};

export const ProformaProvider = ({ children }) => {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('proformas');
      if (saved) {
        setProformas(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading proformas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('proformas', JSON.stringify(proformas));
      } catch (error) {
        console.error('Error saving proformas:', error);
      }
    }
  }, [proformas, loading]);

  const addProforma = (proforma) => {
    const newProforma = {
      ...proforma,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProformas(prev => [newProforma, ...prev]);
    return newProforma;
  };

  const updateProforma = (id, updated) => {
    setProformas(prev => prev.map(p => p.id === id ? { ...updated, id } : p));
  };

  const deleteProforma = (id) => {
    setProformas(prev => prev.filter(p => p.id !== id));
  };

  const getProforma = (id) => {
    return proformas.find(p => p.id === id);
  };

  return (
    <ProformaContext.Provider value={{
      proformas,
      loading,
      addProforma,
      updateProforma,
      deleteProforma,
      getProforma,
    }}>
      {children}
    </ProformaContext.Provider>
  );
};