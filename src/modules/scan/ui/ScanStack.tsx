import React from 'react';
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
