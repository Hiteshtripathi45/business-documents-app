import React, { createContext, useState, useContext } from 'react';

const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState({
    invoices: [],
    quotations: [],
    projectOrders: [],
    eChallans: [],
    proformaInvoices: [],
  });

  const addDocument = (type, document) => {
    setDocuments(prev => ({
      ...prev,
      [type]: [...prev[type], document]
    }));
  };

  const updateDocument = (type, id, updatedDocument) => {
    setDocuments(prev => ({
      ...prev,
      [type]: prev[type].map(doc => doc.id === id ? updatedDocument : doc)
    }));
  };

  const deleteDocument = (type, id) => {
    setDocuments(prev => ({
      ...prev,
      [type]: prev[type].filter(doc => doc.id !== id)
    }));
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};