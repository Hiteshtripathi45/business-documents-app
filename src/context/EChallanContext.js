import React, { createContext, useState, useContext, useEffect } from 'react';

const EChallanContext = createContext();

export const useEChallans = () => {
  const context = useContext(EChallanContext);
  if (!context) {
    throw new Error('useEChallans must be used within a EChallanProvider');
  }
  return context;
};

export const EChallanProvider = ({ children }) => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('challans');
      if (saved) {
        setChallans(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading challans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('challans', JSON.stringify(challans));
      } catch (error) {
        console.error('Error saving challans:', error);
      }
    }
  }, [challans, loading]);

  const addChallan = (challan) => {
    const newChallan = {
      ...challan,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setChallans(prev => [newChallan, ...prev]);
    return newChallan;
  };

  const updateChallan = (id, updated) => {
    setChallans(prev => prev.map(c => c.id === id ? { ...updated, id } : c));
  };

  const deleteChallan = (id) => {
    setChallans(prev => prev.filter(c => c.id !== id));
  };

  const getChallan = (id) => {
    return challans.find(c => c.id === id);
  };

  return (
    <EChallanContext.Provider value={{
      challans,
      loading,
      addChallan,
      updateChallan,
      deleteChallan,
      getChallan,
    }}>
      {children}
    </EChallanContext.Provider>
  );
};