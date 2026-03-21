// src/modules/kot/KotListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function KotListScreen() {
  return (
    <View style={styles.container}>
      <Text>KOT list screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
