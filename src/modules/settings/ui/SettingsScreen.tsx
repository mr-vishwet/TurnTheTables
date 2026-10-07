import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  ScreenContainer,
  SectionHeader,
  SettingRow,
  Toggle,
  FormatChips,
  Chip,
  PromptModal,
  showConfirm,
} from '../../../components/common';
import { useTheme } from '../../core/hooks/useTheme';
import { useAppStore } from '../../core/store/appStore';
import { ExportFormat, ThemeMode } from '../../core/types';

const THEMES: ThemeMode[] = ['light', 'dark', 'system'];

/** Settings & preferences (scope §3.6), all persisted through the store. */
export const SettingsScreen = () => {
  const theme = useTheme();
  const {
    showSystemApps,
    setShowSystemApps,
    defaultExportFormat,
    setDefaultExportFormat,
    themeMode,
    setThemeMode,
    additionalScanRoots,
    setAdditionalScanRoots,
  } = useAppStore();

  const [rootModal, setRootModal] = useState(false);

  const editRoots = (roots: string[]) => {
    if (roots.length === additionalScanRoots.length && roots.every((r, i) => r === additionalScanRoots[i])) {
      setRootModal(false);
      return;
    }
    showConfirm(
      'Replace scan roots?',
      'These extra paths are used on the next scan (rooted devices only).',
      () => {
        setAdditionalScanRoots(roots);
        setRootModal(false);
      },
      'Save',
    );
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Browsing" />
      <SettingRow
        label="Show System Apps"
        value={<Toggle value={showSystemApps} onValueChange={setShowSystemApps} />}
      />

      <SectionHeader title="Export" />
      <SettingRow
        label="Default export format"
        value={<FormatChips value={defaultExportFormat} onChange={(f: ExportFormat) => setDefaultExportFormat(f)} />}
      />

      <SectionHeader title="Appearance" />
      <SettingRow
        label="Theme"
        value={
          <View style={{ flexDirection: 'row' }}>
            {THEMES.map(m => (
              <Chip key={m} label={m} selected={themeMode === m} onPress={() => setThemeMode(m)} />
            ))}
          </View>
        }
      />

      <SectionHeader title="Advanced (rooted devices)" />
      <SettingRow
        label="Additional scan roots"
        value={
          <Text style={{ color: theme.colors.textMuted }}>
            {additionalScanRoots.length ? `${additionalScanRoots.length} path(s)` : 'none'}
          </Text>
        }
        onPress={() => setRootModal(true)}
      />

      <SectionHeader title="About & Help" />
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.sm, lineHeight: 20 }}>
        Turn the Tables discovers SQLite databases in accessible storage and lets you browse, query, edit,
        and export them.{'\n\n'}
        Limitations: Android sandboxes other apps' private data — full coverage needs a rooted device
        (add roots like /data/data above).{'\n\n'}
        Safety: edits and deletes write directly to the opened database files. Data marked for deletion is
        confirmed first and is not recoverable. Backup before modifying live app databases.
      </Text>

      <PromptModal
        visible={rootModal}
        title="Scan roots (one per line)"
        initial={additionalScanRoots.join('\n') || '/data/data'}
        onCancel={() => setRootModal(false)}
        onSubmit={value => editRoots(value.split('\n').map(s => s.trim()).filter(Boolean))}
      />
    </ScreenContainer>
  );
};
