// src/modules/masters/store.ts
import { makeAutoObservable } from 'mobx';
import React, { createContext, useContext } from 'react';

class MastersStore {
  constructor() {
    makeAutoObservable(this);
  }
  // add observable fields/actions later if needed
}

const MastersStoreContext = createContext<MastersStore | null>(null);

export const mastersStore = new MastersStore();

type ProviderProps = { children: React.ReactNode };

export const MastersStoreProvider = ({ children }: ProviderProps) => {
  return React.createElement(
    MastersStoreContext.Provider,
    { value: mastersStore },
    children,
  );
};

export const useMastersStore = () => {
  const ctx = useContext(MastersStoreContext);
  if (!ctx) throw new Error('useMastersStore must be used within provider');
  return ctx;
};
