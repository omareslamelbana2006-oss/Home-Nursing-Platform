import type { Nurse } from '@/lib/supabase';

const LOCAL_NURSES_KEY = 'hn_local_nurses';

type StoredNurse = Nurse & { is_supervisor?: boolean };

export function normalizeNurses(rows: StoredNurse[]): Nurse[] {
  return rows.map((nurse) => ({
    ...nurse,
    is_main_admin: Boolean(nurse.is_main_admin ?? nurse.is_supervisor),
  }));
}

export function getLocalNurses(): Nurse[] {
  const savedNurses = localStorage.getItem(LOCAL_NURSES_KEY);
  if (!savedNurses) return [];

  try {
    return normalizeNurses(JSON.parse(savedNurses) as StoredNurse[]);
  } catch (error) {
    console.error('Could not read locally saved nurses:', error);
    return [];
  }
}

export function saveLocalNurses(nurses: Nurse[]): void {
  localStorage.setItem(LOCAL_NURSES_KEY, JSON.stringify(nurses));
}

export function mergeLocalNurses(remoteNurses: Nurse[]): Nurse[] {
  const remoteIds = new Set(remoteNurses.map((nurse) => nurse.id));
  return [...remoteNurses, ...getLocalNurses().filter((nurse) => !remoteIds.has(nurse.id))];
}

export function isMissingNurseAdminColumn(error: { message: string }): boolean {
  return /is_main_admin.*(column|schema cache)|column.*is_main_admin/i.test(error.message);
}
