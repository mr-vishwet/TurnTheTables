import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const MOCK_APPS = [
  { id: '1', name: 'MyNotes', dbCount: 2 },
  { id: '2', name: 'TaskManager', dbCount: 1 },
];

export const AppsListScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_APPS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('DBTree', { appName: item.name })}
          >
            <Text style={styles.appName}>{item.name}</Text>
            <Text style={styles.dbCount}>{item.dbCount} database(s)</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  appName: { fontSize: 16, fontWeight: 'bold' },
  dbCount: { fontSize: 14, color: '#666', marginTop: 4 },
});
