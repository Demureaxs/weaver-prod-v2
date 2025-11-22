'use client';
import React from 'react';
import { UserContext } from '../contexts/UserContext';

function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { useUser };
