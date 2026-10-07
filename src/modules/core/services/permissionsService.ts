import { Platform } from 'react-native';
import { PERMISSIONS, PermissionStatus, check, openSettings, request } from 'react-native-permissions';

/**
 * Storage permission handling (scope §3.1). Legacy READ_EXTERNAL_STORAGE covers
 * API <= 32. On Android 13+ there is no runtime permission for arbitrary app
 * files ("all files access" lives in system settings), so we surface
 * `denied-prompt-settings` and deep-link the user to settings when needed.
 */

export type PermissionOutcome = 'granted' | 'denied' | 'prompt-settings' | 'unsupported';

const isGranted = (status: PermissionStatus): boolean => status === 'granted';

export const requestStoragePermission = async (): Promise<PermissionOutcome> => {
  if (Platform.OS !== 'android') return 'granted'; // iOS sandbox needs no storage perm

  const sdk = Platform.Version as number;
  if (sdk >= 33) {
    // Scoped storage: app-specific external dirs need no permission; full
    // browsing requires "All files access" from system settings.
    return 'prompt-settings';
  }

  const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  const status = await check(permission);
  if (isGranted(status)) return 'granted';

  const requested = await request(permission);
  if (isGranted(requested)) return 'granted';
  if (requested === 'denied') return 'denied';
  return 'unsupported'; // blocked / unavailable
};

/** Opens system settings so the user can grant "All files access" manually. */
export const openStorageSettings = async (): Promise<void> => {
  try {
    await openSettings();
  } catch {
    // some OEM builds throw; nothing further we can do from JS
  }
};

/** Whether scanning can proceed at all right now. */
export const hasStorageAccess = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const sdk = Platform.Version as number;
  if (sdk >= 33) return true; // best-effort: app-scoped paths always work
  try {
    return isGranted(await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE));
  } catch {
    return false;
  }
};
