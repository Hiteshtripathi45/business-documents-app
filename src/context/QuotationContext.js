import React, { createContext, useState, useContext, useEffect } from 'react';

const QuotationContext = createContext();

export const useQuotations = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotations must be used within a QuotationProvider');
  }
  return context;
};

export const QuotationProvider = ({ children }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quotations');
      if (saved) {
        setQuotations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('quotations', JSON.stringify(quotations));
      } catch (error) {
        console.error('Error saving quotations:', error);
      }
    }
  }, [quotations, loading]);

  const addQuotation = (quotation) => {
    const newQuotation = {
      ...quotation,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setQuotations(prev => [newQuotation, ...prev]);
    return newQuotation;
  };

  const updateQuotation = (id, updated) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...updated, id } : q));
  };

  const deleteQuotation = (id) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const getQuotation = (id) => {
    return quotations.find(q => q.id === id);
  };

  return (
    <QuotationContext.Provider value={{
      quotations,
      loading,
      addQuotation,
      updateQuotation,
      deleteQuotation,
      getQuotation,
    }}>
      {children}
    </QuotationContext.Provider>
  );
};