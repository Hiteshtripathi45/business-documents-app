import React, { createContext, useState, useContext, useEffect } from 'react';

const InvoiceContext = createContext();

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('invoices');
      if (saved) {
        setInvoices(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (error) {
        console.error('Error saving invoices:', error);
      }
    }
  }, [invoices, loading]);

  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id, updated) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...updated, id } : inv));
  };

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const getInvoice = (id) => {
    return invoices.find(inv => inv.id === id);
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      loading,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      getInvoice,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};