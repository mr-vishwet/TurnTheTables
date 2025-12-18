import React from 'react';
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
