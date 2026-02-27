import React, { createContext, useState, useContext, useEffect } from 'react';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const loadCompany = () => {
      try {
        const saved = localStorage.getItem('company');
        if (saved) {
          setCompany(JSON.parse(saved));
        } else {
          // Start with empty company - user must set in Settings
          setCompany({
            name: '',
            address: '',
            phone: '',
            email: '',
            gst: '',
            pan: '',
            logo: null,
            invoicePrefix: 'INV',
            quotationPrefix: 'QTN',
            projectPrefix: 'PO',
            challanPrefix: 'CHL',
            proformaPrefix: 'PI',
            currency: '₹',
            taxRate: 18,
            terms: '',
            footer: '',
          });
        }
      } catch (error) {
        console.error('Error loading company:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompany();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (company && !loading) {
      try {
        localStorage.setItem('company', JSON.stringify(company));
      } catch (error) {
        console.error('Error saving company:', error);
      }
    }
  }, [company, loading]);

  const updateCompany = (newData) => {
    setCompany(prev => ({ ...prev, ...newData }));
  };

  return (
    <CompanyContext.Provider value={{
      company,
      loading,
      updateCompany,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};