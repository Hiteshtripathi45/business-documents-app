import React, { createContext, useState, useContext, useEffect } from 'react';

const ProjectOrderContext = createContext();

export const useProjectOrders = () => {
  const context = useContext(ProjectOrderContext);
  if (!context) {
    throw new Error('useProjectOrders must be used within a ProjectOrderProvider');
  }
  return context;
};

export const ProjectOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('projectOrders');
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading project orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('projectOrders', JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving project orders:', error);
      }
    }
  }, [orders, loading]);

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id, updated) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...updated, id } : o));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const getOrder = (id) => {
    return orders.find(o => o.id === id);
  };

  return (
    <ProjectOrderContext.Provider value={{
      projectOrders: orders,
      loading,
      addProjectOrder: addOrder,
      updateProjectOrder: updateOrder,
      deleteProjectOrder: deleteOrder,
      getProjectOrder: getOrder,
    }}>
      {children}
    </ProjectOrderContext.Provider>
  );
};