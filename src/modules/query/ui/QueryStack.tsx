import React from 'react';
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
