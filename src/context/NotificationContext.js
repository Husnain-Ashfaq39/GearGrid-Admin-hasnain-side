// src/context/NotificationContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading, isError, error } = useProducts(); // Destructure isLoading and isError

  useEffect(() => {
    if (products) {
      const lowStockProducts = products.filter(product => {
        const threshold = product.lowStockAlert || 20; // Use custom threshold or default to 20
        return product.stockQuantity < threshold;
      });

      const newNotifications = lowStockProducts.map(product => ({
        id: product.$id,
        productId: product.$id,
        title: 'Low Stock Alert',
        message: `${product.name} has only ${product.stockQuantity} units left (Alert threshold: ${product.lowStockAlert || 20})`,
        seen: false,
        timestamp: new Date().toISOString(),
      }));

      setNotifications(newNotifications);
      setUnseenCount(newNotifications.length);
    }
  }, [products]);

  useEffect(() => {
    if (notifications.length > 0) {
      const filtered = notifications.filter(notification =>
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotifications(filtered);
    } else {
      setFilteredNotifications([]);
    }
  }, [searchQuery, notifications]);

  const markAsSeen = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, seen: true }
          : notif
      )
    );
    setUnseenCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsSeen = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, seen: true }))
    );
    setUnseenCount(0);
  };

  const value = {
    notifications: filteredNotifications,
    unseenCount,
    markAsSeen,
    markAllAsSeen,
    setSearchQuery,
    isLoading, // Expose isLoading
    isError,   // Expose isError
    error,     // Optionally expose error details
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the NotificationContext
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
