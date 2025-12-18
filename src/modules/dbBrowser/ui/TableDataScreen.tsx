import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const MOCK_DATA = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

export const TableDataScreen = ({ route }: any) => {
  const { tableName } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Data from: {tableName}</Text>
      <FlatList
        data={MOCK_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.id} | {item.name} | {item.email}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});
