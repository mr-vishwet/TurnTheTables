import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ActionSheetIOS, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { ScreenContainer, StatusBanner, SearchInput, Button, PromptModal, showConfirm, SectionHeader } from '../../../components/common';
import { useTheme } from '../../core/hooks/useTheme';
import { useAppStore } from '../../core/store/appStore';
import { CellValue, PaginatedRows, RootStackParamList, ExportFormat } from '../../core/types';
import { fetchRowPage, updateCell, deleteRow, dropTable } from '../../core/services/sqliteService';
import { exportAndShare } from '../../core/services/fileExportService';

const PAGE_SIZE = 50;

type Route = RouteProp<RootStackParamList, 'TableData'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CellAction {
  column: string;
  rowId: number;
  value: CellValue;
}

/** Table data view (scope §3.4): paginated, searchable, editable, exportable. */
export const TableDataScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { dbPath, table } = route.params ?? {};
  const defaultExportFormat = useAppStore(s => s.defaultExportFormat);

  const [data, setData] = useState<PaginatedRows | null>(null);
  const [accumulated, setAccumulated] = useState<Record<string, CellValue>[]>([]);
  const [page, setPage] = useState(0);
  const [term, setTerm] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<CellAction | null>(null);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (!dbPath || !table) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchRowPage(dbPath, table, nextPage, PAGE_SIZE, {
          term,
          columns: columns.length ? columns : [],
        });
        setData(rows);
        setAccumulated(prev => (replace ? rows.rows : [...prev, ...rows.rows]));
        setPage(nextPage);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load rows');
      } finally {
        setLoading(false);
      }
    },
    [dbPath, table, term, columns],
  );

  // Column list drives the cross-column search; seed once via a first page.
  useEffect(() => {
    if (!dbPath || !table) return;
    let cancelled = false;
    (async () => {
      const first = await fetchRowPage(dbPath, table, 0, PAGE_SIZE);
      if (!cancelled) {
        setColumns(first.columns.filter(c => c !== '_rid'));
        setData(first);
        setAccumulated(first.rows);
      }
    })().catch(e => setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [dbPath, table]);

  useEffect(() => {
    // re-run search against page 0 whenever the term settles
    if (columns.length) loadPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const onCellLongPress = (cell: CellAction) => {
    const options = ['Copy value', 'Edit value…', 'Delete row', 'Cancel'];
    const run = (idx: number) => {
      if (idx === 0) {
        Clipboard.setString(cell.value instanceof Uint8Array ? '<blob>' : String(cell.value ?? ''));
        flash(`Copied ${cell.column}`);
      } else if (idx === 1) {
        setEditing(cell);
      } else if (idx === 2) {
        showConfirm('Delete row?', `Row ${cell.rowId} will be permanently deleted.`, async () => {
          try {
            await deleteRow(dbPath, table, cell.rowId);
            loadPage(0, true);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Delete failed');
          }
        });
      }
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        run,
      );
    } else {
      // Android: keep it dependency-free with an Alert chooser (Edit guarded separately)
      Alert.alert(`${cell.column}`, `Value: ${String(cell.value ?? 'NULL')}`, [
        { text: 'Copy value', onPress: () => run(0) },
        { text: 'Edit value…', onPress: () => run(1) },
        { text: 'Delete row', style: 'destructive', onPress: () => run(2) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const submitEdit = async (value: string) => {
    if (!editing) return;
    try {
      await updateCell(dbPath, table, editing.rowId, editing.column, value);
      setEditing(null);
      flash('Cell updated');
      loadPage(page, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const doExport = (format: ExportFormat) =>
    exportAndShare({ columns: ['_rid', ...columns], rows: accumulated, rowsAffected: 0, executionMs: 0 }, format, `${table}_data`)
      .then(uri => flash(`Exported to ${uri.split('/').pop()}`))
      .catch(e => {
        if (e && !/cancel|dismiss/i.test(String(e?.message ?? e))) {
          setError(e instanceof Error ? e.message : 'Export failed');
        }
      });

  const onDeleteTable = () =>
    showConfirm('Delete table?', `${table} and all its rows will be dropped.`, async () => {
      try {
        await dropTable(dbPath, table);
        navigation.goBack();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Drop failed');
      }
    });

  const cellText = (v: CellValue) =>
    v === null ? 'NULL' : v instanceof Uint8Array ? `<blob ${v.length}B>` : String(v);

  const renderRow = ({ item, index }: { item: Record<string, CellValue>; index: number }) => (
    <View style={[styles.rowBlock, { backgroundColor: index % 2 ? theme.colors.surface : 'transparent' }]}>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>
        rowid {String(item._rid ?? '?')}
      </Text>
      {columns.map(col => (
        <Pressable
          key={col}
          onLongPress={() => onCellLongPress({ column: col, rowId: Number(item._rid ?? -1), value: item[col] })}
          style={styles.cell}
        >
          <Text style={{ color: theme.colors.primary, fontSize: theme.typography.sizes.xs, width: 110 }} numberOfLines={1}>
            {col}
          </Text>
          <Text style={{ color: theme.colors.text, flex: 1, fontSize: theme.typography.sizes.sm }} numberOfLines={2}>
            {cellText(item[col])}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScreenContainer>
      <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>
        {dbPath}
      </Text>
      {error ? <StatusBanner kind="error" message={error} /> : null}
      {notice ? <StatusBanner kind="success" message={notice} /> : null}

      <SearchInput onSearch={setTerm} placeholder="Search across columns…" />

      <View style={styles.actionRow}>
        <Button label={`Export ${defaultExportFormat.toUpperCase()}`} variant="secondary" onPress={() => doExport(defaultExportFormat)} />
        <Button label="Export CSV" variant="secondary" onPress={() => doExport('csv')} />
        <Button label="Delete table" variant="destructive" onPress={onDeleteTable} />
      </View>

      <SectionHeader title={`${data?.totalRows ?? 0} matching row(s) · showing ${accumulated.length}`} />

      <FlatList
        data={accumulated}
        keyExtractor={(item, i) => String(item._rid ?? i)}
        renderItem={renderRow}
        onEndReached={() => {
          if (data?.hasMore && !loading) loadPage(page + 1, false);
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? <StatusBanner kind="info" message="Loading…" /> : null
        }
      />

      <PromptModal
        visible={editing !== null}
        title={`Edit ${editing?.column ?? ''}`}
        initial={String(editing?.value ?? '')}
        onCancel={() => setEditing(null)}
        onSubmit={submitEdit}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  rowBlock: { padding: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#8884' },
  cell: { flexDirection: 'row', paddingVertical: 3, alignItems: 'flex-start' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
});
