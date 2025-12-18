#!/usr/bin/env python3
from pathlib import Path

# Assumes script runs from project root where package.json exists
PROJECT_ROOT = Path.cwd()

FOLDERS = [
    "src/assets/fonts",
    "src/assets/images",
    "src/modules/core/ui",
    "src/modules/core/hooks",
    "src/modules/core/services",
    "src/modules/core/types",
    "src/modules/navigation",
    "src/modules/scan/ui",
    "src/modules/scan/hooks",
    "src/modules/scan/services",
    "src/modules/scan/types",
    "src/modules/apps/ui",
    "src/modules/apps/hooks",
    "src/modules/apps/services",
    "src/modules/apps/types",
    "src/modules/dbBrowser/ui",
    "src/modules/dbBrowser/hooks",
    "src/modules/dbBrowser/services",
    "src/modules/dbBrowser/types",
    "src/modules/query/ui",
    "src/modules/query/hooks",
    "src/modules/query/services",
    "src/modules/query/types",
    "src/modules/settings/ui",
    "src/modules/settings/hooks",
    "src/modules/settings/services",
    "src/modules/settings/types",
    "src/components/common",
    "src/theme",
    "src/utils",
]

FILES = {
    "src/modules/navigation/App.tsx": """import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';

export const App = () => (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
);
""",
    "src/modules/navigation/RootNavigator.tsx": """import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ScanStack } from '../scan/ui/ScanStack';
import { QueryStack } from '../query/ui/QueryStack';
import { SettingsStack } from '../settings/ui/SettingsStack';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={ScanStack} options={{ headerShown: false }} />
      <Tab.Screen name="Query" component={QueryStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};
""",
    "src/modules/scan/ui/ScanStack.tsx": """import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScanScreen } from './ScanScreen';
import { AppsListScreen } from '../../apps/ui/AppsListScreen';
import { DBTreeScreen } from '../../dbBrowser/ui/DBTreeScreen';
import { TableDataScreen } from '../../dbBrowser/ui/TableDataScreen';

const Stack = createNativeStackNavigator();

export const ScanStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan Device' }} />
      <Stack.Screen name="AppsList" component={AppsListScreen} options={{ title: 'Apps with Databases' }} />
      <Stack.Screen name="DBTree" component={DBTreeScreen} options={{ title: 'Database & Tables' }} />
      <Stack.Screen name="TableData" component={TableDataScreen} options={{ title: 'Table Data' }} />
    </Stack.Navigator>
  );
};
""",
    "src/modules/scan/ui/ScanScreen.tsx": """import React, { useState } from 'react';
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
""",
    "src/modules/apps/ui/AppsListScreen.tsx": """import React from 'react';
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
""",
    "src/modules/dbBrowser/ui/DBTreeScreen.tsx": """import React from 'react';
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
""",
    "src/modules/dbBrowser/ui/TableDataScreen.tsx": """import React from 'react';
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
""",
    "src/modules/query/ui/QueryStack.tsx": """import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryScreen } from './QueryScreen';

const Stack = createNativeStackNavigator();

export const QueryStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="QueryMaster" component={QueryScreen} options={{ title: 'Query Master' }} />
    </Stack.Navigator>
  );
};
""",
    "src/modules/query/ui/QueryScreen.tsx": """import React, { useState } from 'react';
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
""",
    "src/modules/settings/ui/SettingsStack.tsx": """import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './SettingsScreen';

const Stack = createNativeStackNavigator();

export const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
};
""",
    "src/modules/settings/ui/SettingsScreen.tsx": """import React, { useState } from 'react';
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
""",
    "src/modules/core/services/sqliteService.ts": """export class SQLiteService {
  // TODO: Implement DB scanning, opening, query execution
}
""",
    "src/modules/core/services/fileExportService.ts": """export const exportToJSON = (data: any[]) => {
  // TODO
};

export const exportToCSV = (data: any[]) => {
  // TODO
};
""",
    "src/modules/core/services/permissionsService.ts": """export const requestStoragePermission = async () => {
  // TODO: Use react-native-permissions
};
""",
    "src/modules/core/types/index.ts": """export interface AppInfo {
  id: string;
  name: string;
  dbCount: number;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
}
""",
    "src/theme/index.ts": """export const colors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  text: '#000000',
};
""",
}

def main():
    for folder in FOLDERS:
        path = PROJECT_ROOT / folder
        path.mkdir(parents=True, exist_ok=True)
        print(f"✓ {path}")
    
    for relative_path, content in FILES.items():
        file_path = PROJECT_ROOT / relative_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content.strip() + "\n", encoding="utf-8")
        print(f"✓ {file_path}")
    
    print("\n✓ Modular structure created!")
    print("\nNext: Install navigation dependencies:")
    print("  npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack")
    print("  npm install react-native-screens react-native-safe-area-context")

if __name__ == "__main__":
    main()
