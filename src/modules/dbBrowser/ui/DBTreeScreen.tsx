import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ScreenContainer, StatusBanner, EmptyState, SectionHeader, showConfirm, PromptModal } from '../../../components/common';
import { useTheme } from '../../core/hooks/useTheme';
import { useAppStore } from '../../core/store/appStore';
import { DatabaseFile, TableInfo, RootStackParamList } from '../../core/types';
import { statDatabase } from '../../core/services/scanService';
import { listTables, deleteDatabase, createTable } from '../../core/services/sqliteService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DBTree'>;

/** Database & tables tree (scope §3.3): live schemas, DB delete, table create. */
export const DBTreeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const appId = route.params?.appId;
  const app = useAppStore(s => s.apps.find(a => a.id === appId));

  const [dbs, setDbs] = useState<DatabaseFile[]>([]);
  const [tablesByDb, setTablesByDb] = useState<Record<string, TableInfo[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [createFor, setCreateFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!app) return;
    setError(null);
    try {
      const stats = await Promise.all(app.dbPaths.map(statDatabase));
      setDbs(stats);
      const entries = await Promise.all(
        app.dbPaths.map(async p => [p, await listTables(p)] as const),
      );
      setTablesByDb(Object.fromEntries(entries));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read databases');
    }
  }, [app]);

  useEffect(() => {
    load();
  }, [load]);

  const onDeleteDb = (db: DatabaseFile) =>
    showConfirm('Delete database?', `${db.name} will be permanently removed from disk.`, async () => {
      try {
        await deleteDatabase(db.path);
        load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    });

  const formatSize = (bytes: number) =>
    bytes < 0 ? 'unknown size' : bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  const header = useMemo(
    () => (
      <View>
        {error ? <StatusBanner kind="error" message={error} /> : null}
        <SectionHeader title={`${app?.name ?? 'App'} — ${dbs.length} database(s)`} />
      </View>
    ),
    [error, app, dbs.length],
  );

  const renderDb = ({ item }: { item: DatabaseFile }) => {
    const tables = tablesByDb[item.path] ?? [];
    const open = expanded[item.path];
    return (
      <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }}>
        <Pressable
          onPress={() => setExpanded(e => ({ ...e, [item.path]: !e[item.path] }))}
          style={styles.dbRow}
        >
          <View style={styles.dbText}>
            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.md }}>
              {open ? '▾' : '▸'} {item.name}
            </Text>
            <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs, marginTop: 2 }}>
              {item.path} · {formatSize(item.sizeBytes)} · {tables.length} tables
            </Text>
          </View>
          <Pressable onPress={() => setCreateFor(item.path)} hitSlop={12}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700', marginRight: 14 }}>+ table</Text>
          </Pressable>
          <Pressable onPress={() => onDeleteDb(item)} hitSlop={12}>
            <Text style={{ color: theme.colors.destructive, fontWeight: '700' }}>delete</Text>
          </Pressable>
        </Pressable>

        {open ? (
          tables.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, padding: 12 }}>No user tables.</Text>
          ) : (
            tables.map(t => (
              <Pressable
                key={t.name}
                onPress={() => navigation.navigate('TableData', { dbPath: item.path, table: t.name })}
                style={styles.tableRow}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '500' }}>{t.name}</Text>
                <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs, marginTop: 2 }}>
                  {t.columns.map(c => `${c.name}:${c.type || '?'}`).join('  ') || 'no columns'}
                </Text>
              </Pressable>
            ))
          )
        ) : null}
      </View>
    );
  };

  const onCreateTable = async (spec: string) => {
    if (!createFor) return;
    try {
      // "name(col1 TEXT, col2 INTEGER pk, ...)" minimal parser
      const m = spec.match(/^([A-Za-z0-9_]+)\((.+)\)$/);
      if (!m) throw new Error('Use: name(col1 TEXT, col2 INTEGER pk)');
      const cols = m[2].split(',').map(part => {
        const bits = part.trim().split(/\s+/);
        return { name: bits[0], type: bits[1] ?? 'TEXT', primaryKey: /\b(pk|primary)\b/i.test(part) };
      });
      await createTable(createFor, m[1], cols);
      setCreateFor(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
      setCreateFor(null);
    }
  };

  return (
    <ScreenContainer>
      <FlatList
        data={dbs}
        keyExtractor={item => item.path}
        renderItem={renderDb}
        ListHeaderComponent={header}
        ListEmptyComponent={!error ? <EmptyState title="No databases" hint="This app has no readable SQLite files." /> : null}
      />
      <PromptModal
        visible={createFor !== null}
        title="New table"
        initial="my_table(id INTEGER pk, name TEXT)"
        onCancel={() => setCreateFor(null)}
        onSubmit={onCreateTable}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  dbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  dbText: { flex: 1, marginRight: 8 },
  tableRow: {
    paddingVertical: 10,
    paddingLeft: 24,
    backgroundColor: 'rgba(120,120,120,0.06)',
  },
});
