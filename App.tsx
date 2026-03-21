// App.tsx
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { MastersStoreProvider } from './src/modules/masters/store';

export default function App() {
  return (
    <MastersStoreProvider>
      <RootNavigator />
    </MastersStoreProvider>
  );
}
