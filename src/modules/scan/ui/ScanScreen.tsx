import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';

export const ScanScreen = ({ navigation }: any) => {
  const [scanning, setScanning] = useState(false);

  const onScanPress = async () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      navigation.navigate('AppsList');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan device for SQLite databases</Text>
      {scanning ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Start Scan" onPress={onScanPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
});
