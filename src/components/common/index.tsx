import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../modules/core/hooks/useTheme';
import { ExportFormat } from '../../modules/core/types';

/**
 * Common component kit (project_context.md §6). All components read design
 * tokens from useTheme(), so light/dark switching is automatic.
 */

export const ScreenContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.screenPadding}>{children}</View>
    </SafeAreaView>
  );
};

export const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const theme = useTheme();
  return (
    <Text
      style={[
        styles.sectionHeader,
        { color: theme.colors.textMuted, fontSize: theme.typography.sizes.sm },
      ]}
    >
      {title.toUpperCase()}
    </Text>
  );
};

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}) => {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'destructive'
        ? theme.colors.destructive
        : theme.colors.surface;
  const fg = variant === 'secondary' ? theme.colors.text : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderRadius: theme.radii.md,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
};

interface SearchInputProps {
  placeholder?: string;
  onSearch: (term: string) => void;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search…',
  onSearch,
  debounceMs = 300,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next), debounceMs);
  };
  return (
    <TextInput
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      style={[
        styles.input,
        {
          color: theme.colors.text,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radii.md,
        },
      ]}
    />
  );
};

export const MultiLineInput: React.FC<{
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  min_height?: number;
}> = props => {
  const theme = useTheme();
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={theme.colors.textMuted}
      multiline
      style={[
        styles.input,
        styles.mono,
        {
          color: theme.colors.text,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radii.md,
          minHeight: props.min_height ?? 80,
        },
      ]}
    />
  );
};

export type BannerKind = 'success' | 'error' | 'info';

export const StatusBanner: React.FC<{ kind: BannerKind; message: string }> = ({
  kind,
  message,
}) => {
  const theme = useTheme();
  const color =
    kind === 'success' ? theme.colors.success : kind === 'error' ? theme.colors.error : theme.colors.primary;
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: color, borderRadius: theme.radii.sm },
      ]}
    >
      <Text style={styles.bannerText} numberOfLines={3}>
        {message}
      </Text>
    </View>
  );
};

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => {
  const theme = useTheme();
  return (
    <View style={styles.emptyState}>
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.lg }}>
        {title}
      </Text>
      {hint ? (
        <Text style={{ color: theme.colors.textMuted, marginTop: 6, textAlign: 'center' }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

export const Chip: React.FC<{
  label: string;
  selected?: boolean;
  onPress?: () => void;
}> = ({ label, selected, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderRadius: theme.radii.pill,
        },
      ]}
    >
      <Text style={{ color: selected ? '#FFFFFF' : theme.colors.text, fontSize: theme.typography.sizes.sm }}>
        {label}
      </Text>
    </Pressable>
  );
};

export const SettingRow: React.FC<{
  label: string;
  value?: React.ReactNode;
  onPress?: () => void;
}> = ({ label, value, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingRow,
        { borderColor: theme.colors.border },
        onPress ? undefined : styles.settingRowStatic,
      ]}
      disabled={!onPress}
    >
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.md }}>{label}</Text>
      <View>{value}</View>
    </Pressable>
  );
};

export const Toggle: React.FC<{ value: boolean; onValueChange: (v: boolean) => void }> = ({
  value,
  onValueChange,
}) => {
  const theme = useTheme();
  return <Switch value={value} onValueChange={onValueChange} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} />;
};

/** Confirmation dialog for destructive operations (scope §3.7). */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Delete',
): void => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
};

/** Simple single-field modal used for cell editing (scope §3.4). */
export const PromptModal: React.FC<{
  visible: boolean;
  title: string;
  initial: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}> = ({ visible, title, initial, onCancel, onSubmit }) => {
  const theme = useTheme();
  const [value, setValue] = useState(initial);
  React.useEffect(() => setValue(initial), [initial, visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radii.lg },
          ]}
        >
          <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.lg }}>
            {title}
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            multiline
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.md,
                marginTop: theme.spacing.md,
              },
            ]}
          />
          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} />
            <Button label="Save" onPress={() => onSubmit(value)} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

/** Format picker row shared by Settings and export actions. */
export const FormatChips: React.FC<{
  value: ExportFormat;
  onChange: (f: ExportFormat) => void;
}> = ({ value, onChange }) => (
  <View style={styles.chipRow}>
    {(['json', 'csv', 'tsv'] as ExportFormat[]).map(f => (
      <Chip key={f} label={f.toUpperCase()} selected={value === f} onPress={() => onChange(f)} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  screenPadding: { flex: 1, padding: 16 },
  sectionHeader: { letterSpacing: 1, marginBottom: 8, marginTop: 16, fontWeight: '600' },
  button: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, padding: 12, fontSize: 15 },
  mono: { fontFamily: 'Menlo' },
  banner: { padding: 10, marginVertical: 8 },
  bannerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, marginRight: 8 },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowStatic: { paddingVertical: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { padding: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
});
