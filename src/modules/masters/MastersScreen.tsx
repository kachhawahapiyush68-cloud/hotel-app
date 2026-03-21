// src/modules/masters/MastersScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MastersScreen() {
  return (
    <View style={styles.container}>
      <Text>Masters screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
