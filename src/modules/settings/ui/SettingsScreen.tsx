import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export const SettingsScreen = () => {
  const [showSystemApps, setShowSystemApps] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Show System Apps</Text>
        <Switch value={showSystemApps} onValueChange={setShowSystemApps} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Default Export Format</Text>
        <Text style={styles.value}>JSON</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>About</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  label: { fontSize: 16 },
  value: { fontSize: 14, color: '#666' },
});
