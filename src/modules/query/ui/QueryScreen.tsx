import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

export const QueryScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const onRunQuery = () => {
    setResults([{ id: '1', output: 'Mock result row' }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter SQL or natural language query:</Text>
      <TextInput
        style={styles.input}
        placeholder="SELECT * FROM users"
        value={query}
        onChangeText={setQuery}
        multiline
      />
      <Button title="Run Query" onPress={onRunQuery} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.result}>{item.output}</Text>}
        style={styles.resultsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10, minHeight: 60 },
  resultsList: { marginTop: 15 },
  result: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});
