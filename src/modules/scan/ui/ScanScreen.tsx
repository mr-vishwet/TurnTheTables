import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer, StatusBanner, Button, SectionHeader } from '../../../components/common';
import { useTheme } from '../../core/hooks/useTheme';
import { useAppStore } from '../../core/store/appStore';
import { ScanProgress } from '../../core/types';
import { requestStoragePermission } from '../../core/services/permissionsService';
import { scanForDatabases, defaultScanRoots } from '../../core/services/scanService';
import { RootStackParamList } from '../../core/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ScanScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const setScanResults = useAppStore(s => s.setScanResults);
  const lastScanAt = useAppStore(s => s.lastScanAt);
  const apps = useAppStore(s => s.apps);
  const additionalScanRoots = useAppStore(s => s.additionalScanRoots);

  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    setError(null);
    setScanning(true);
    try {
      const outcome = await requestStoragePermission();
      if (outcome === 'denied') {
        setError('Storage permission denied. Grant access in system settings and retry.');
        setScanning(false);
        return;
      }
      if (outcome === 'prompt-settings') {
        setError('Android 13+ note: only shared/app-scoped storage is reachable without “All files access”. Scanning continues.');
      }
      const found = await scanForDatabases(additionalScanRoots, setProgress);
      setScanResults(found);
      if (found.length === 0) {
        setError('No SQLite databases found. On a non-rooted device only shared/external storage is reachable.');
      } else {
        navigation.navigate('AppsList');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed unexpectedly');
    } finally {
      setScanning(false);
    }
  };

  const container = { flex: 1 as const };

  return (
    <ScreenContainer>
      <View style={container}>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.typography.sizes.xl }]}>
          Turn the Tables
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>
          Discover and inspect SQLite databases on this device.
        </Text>

        <SectionHeader title="Scan roots" />
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.sm }}>
          {[...defaultScanRoots(), ...additionalScanRoots].join('\n') || 'none configured'}
        </Text>

        {error ? <StatusBanner kind="error" message={error} /> : null}
        {progress && scanning ? (
          <>
            <StatusBanner
              kind="info"
              message={`Scanning… ${progress.scannedFiles} files checked, ${progress.foundDatabases} DBs found`}
            />
            {progress.currentPath ? (
              <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>
                {progress.currentPath}
              </Text>
            ) : null}
          </>
        ) : null}

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button label={scanning ? 'Scanning…' : 'Start Scan'} onPress={startScan} loading={scanning} />
        </View>

        {apps.length > 0 && !scanning ? (
          <View style={{ marginTop: theme.spacing.md }}>
            <Button
              label={`Browse results (${apps.length} apps)`}
              variant="secondary"
              onPress={() => navigation.navigate('AppsList')}
            />
            {lastScanAt ? (
              <Text style={{ color: theme.colors.textMuted, marginTop: 8, textAlign: 'center' }}>
                Last scan: {new Date(lastScanAt).toLocaleString()}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginTop: 24 },
});
