'use client';
import React, { createContext, useReducer } from 'react';

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface Character {
  id: string;
  name: string;
  bio: string;
}

export interface Book {
  id: string;
  title: string;
  chapters?: Chapter[];
  characters?: Character[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  credits: number;
  plan: string;
  activeCount: number;
  sitemap?: string[];
  keywords?: string[];
  articles?: any[];
  books?: Book[];
}

const UserContext = createContext(undefined);

function userReducer(state, action) {
  switch (action.type) {
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, { user: null });
  const value = { state, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export { UserProvider, UserContext };
