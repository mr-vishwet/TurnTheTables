import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer, EmptyState, Chip } from '../../../components/common';
import { useTheme } from '../../core/hooks/useTheme';
import { useAppStore } from '../../core/store/appStore';
import { AppEntry, RootStackParamList } from '../../core/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Apps with databases (scope §3.2): real scan results + system-app filter. */
export const AppsListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const apps = useAppStore(s => s.apps);
  const showSystemApps = useAppStore(s => s.showSystemApps);

  const visible = showSystemApps ? apps : apps.filter(a => !a.isSystemApp);

  const renderItem = ({ item }: { item: AppEntry }) => (
    <Pressable
      onPress={() => navigation.navigate('DBTree', { appId: item.id })}
      style={({ pressed }) => [
        styles.item,
        {
          borderBottomColor: theme.colors.border,
          backgroundColor: pressed ? theme.colors.surface : 'transparent',
        },
      ]}
    >
      <View style={styles.itemText}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.md, fontWeight: '600' }}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs, marginTop: 2 }}>
          {item.id}
        </Text>
      </View>
      {item.isSystemApp ? <Chip label="SYSTEM" /> : null}
      <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
        {item.dbPaths.length} DB{item.dbPaths.length === 1 ? '' : 's'}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title="No apps with databases yet"
            hint="Run a scan from the Home tab first. System apps are hidden unless enabled in Settings."
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: { flex: 1, marginRight: 10 },
});
