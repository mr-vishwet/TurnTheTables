import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer, StatusBanner, Button, Chip, SectionHeader, MultiLineInput, EmptyState, FormatChips } from '../../../components/common';
import { useTheme } from '../../core/hooks/useTheme';
import { useAppStore, selectAllDbPaths } from '../../core/store/appStore';
import { CellValue, ExportFormat, QueryResult, QueryHistoryItem } from '../../core/types';
import { executeQuery, PREBUILT_QUERIES } from '../../core/services/sqliteService';
import { exportAndShare } from '../../core/services/fileExportService';

const basename = (p: string) => p.slice(p.lastIndexOf('/') + 1);

/** Query Master (scope §3.5): Direct SQL mode. NL mode is deferred (ADR-6). */
export const QueryScreen = () => {
  const theme = useTheme();
  const dbPaths = useAppStore(selectAllDbPaths);
  const queryHistory = useAppStore(s => s.queryHistory);
  const addHistoryItem = useAppStore(s => s.addHistoryItem);
  const clearHistory = useAppStore(s => s.clearHistory);
  const defaultExportFormat = useAppStore(s => s.defaultExportFormat);

  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(defaultExportFormat);

  const activeDb = selectedDb ?? dbPaths[0] ?? null;

  const run = async (statement: string) => {
    if (!activeDb) {
      setError('No database selected — run a device scan first.');
      return;
    }
    if (!statement.trim()) return;
    setRunning(true);
    setError(null);
    try {
      const res = await executeQuery(activeDb, statement);
      setResult(res);
      addHistoryItem({
        id: `${Date.now()}`,
        sql: statement,
        dbPath: activeDb,
        runAt: Date.now(),
        ok: true,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Query failed';
      setError(message);
      setResult(null);
      addHistoryItem({ id: `${Date.now()}`, sql: statement, dbPath: activeDb, runAt: Date.now(), ok: false });
    } finally {
      setRunning(false);
    }
  };

  const gridColumns = useMemo(() => result?.columns ?? [], [result]);

  const cellText = (v: CellValue) =>
    v === null ? 'NULL' : v instanceof Uint8Array ? `<blob ${v.length}B>` : String(v);

  const renderResultRow = ({ item, index }: { item: Record<string, CellValue>; index: number }) => (
    <View style={[styles.resultRow, { backgroundColor: index % 2 ? theme.colors.surface : 'transparent' }]}>
      {gridColumns.map(c => (
        <Text key={c} numberOfLines={2} style={{ color: theme.colors.text, fontSize: theme.typography.sizes.xs, flex: 1, padding: 4 }}>
          {cellText(item[c])}
        </Text>
      ))}
    </View>
  );

  return (
    <ScreenContainer>
      {dbPaths.length === 0 ? (
        <EmptyState title="No databases available" hint="Run a device scan from the Home tab to populate the Query Master." />
      ) : (
        <>
          <SectionHeader title={`Target database (${dbPaths.length} available)`} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dbPaths}
            keyExtractor={p => p}
            style={styles.dbPicker}
            renderItem={({ item }) => (
              <Chip label={basename(item)} selected={item === activeDb} onPress={() => setSelectedDb(item)} />
            )}
          />

          <MultiLineInput value={sql} onChangeText={setSql} placeholder="SELECT * FROM sqlite_master;" />

          <View style={styles.actionRow}>
            <Button label="Run" onPress={() => run(sql)} loading={running} disabled={!sql.trim()} />
            <Button label="History" variant="secondary" onPress={() => setShowHistory(h => !h)} />
          </View>

          <SectionHeader title="Prebuilt queries" />
          <View style={styles.presetRow}>
            {PREBUILT_QUERIES.map(p => (
              <Chip key={p.label} label={p.label} onPress={() => { setSql(p.sql); run(p.sql); }} />
            ))}
          </View>

          {error ? <StatusBanner kind="error" message={error} /> : null}

          {result ? (
            <>
              <SectionHeader
                title={
                  gridColumns.length
                    ? `${result.rows.length} row(s) · ${result.executionMs} ms`
                    : `OK · ${result.rowsAffected} row(s) affected`
                }
              />
              <View style={styles.exportRow}>
                <FormatChips value={exportFormat} onChange={setExportFormat} />
                <Button
                  label="Export"
                  variant="secondary"
                  onPress={() => exportAndShare(result, exportFormat, 'query_result').catch(() => undefined)}
                />
              </View>
              {gridColumns.length ? (
                <FlatList
                  data={result.rows.slice(0, 500)}
                  keyExtractor={(_, i) => String(i)}
                  renderItem={renderResultRow}
                />
              ) : null}
            </>
          ) : null}

          {showHistory ? (
            <>
              <SectionHeader title="Query history" />
              <Pressable onPress={clearHistory}>
                <Text style={{ color: theme.colors.destructive, fontSize: theme.typography.sizes.sm, marginBottom: 6 }}>
                  Clear history
                </Text>
              </Pressable>
              <FlatList
                data={queryHistory}
                keyExtractor={(item: QueryHistoryItem) => item.id}
                style={styles.historyList}
                ListEmptyComponent={<Text style={{ color: theme.colors.textMuted }}>No queries yet.</Text>}
                renderItem={({ item }: { item: QueryHistoryItem }) => (
                  <Pressable
                    onPress={() => setSql(item.sql)} // re-run & edit (scope §3.5)
                    style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}
                  >
                    <Text numberOfLines={2} style={{ color: item.ok ? theme.colors.text : theme.colors.error, fontFamily: 'Menlo', fontSize: 12 }}>
                      {item.sql}
                    </Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 2 }}>
                      {basename(item.dbPath)} · {new Date(item.runAt).toLocaleTimeString()} · {item.ok ? 'ok' : 'error'}
                    </Text>
                  </Pressable>
                )}
              />
            </>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  dbPicker: { flexGrow: 0, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  exportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#8884' },
  historyList: { flexGrow: 0 },
  historyItem: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
});
