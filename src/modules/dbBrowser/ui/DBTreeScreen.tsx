import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const MOCK_TABLES = [
  { id: '1', name: 'users', columns: ['id', 'name', 'email'] },
  { id: '2', name: 'notes', columns: ['id', 'title', 'content', 'created_at'] },
];

export const DBTreeScreen = ({ navigation, route }: any) => {
  const { appName } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tables in {appName}</Text>
      <FlatList
        data={MOCK_TABLES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('TableData', { tableName: item.name })}
          >
            <Text style={styles.tableName}>{item.name}</Text>
            <Text style={styles.columns}>{item.columns.join(', ')}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tableName: { fontSize: 16, fontWeight: 'bold' },
  columns: { fontSize: 12, color: '#666', marginTop: 4 },
});
