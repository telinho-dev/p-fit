export type ExerciseLog = {
  sessionKey: string;
  exerciseKey: string;
  week: number; // ISO week of year (1..53)
  setNumber: number; // 0 = notes record, 1..N = individual set records
  load: string;
  reps: string;
  notes: string; // meaningful on setNumber === 0 (exercise-level notes)
};

export type WeeklyLog = {
  week: number; // ISO week of year (1..53)
  weightKg: number | null;
  waistCm: number | null;
  sessionsDone: number | null;
  cardiosDone: number | null;
  proteinAvg: number | null;
  sleepAvg: number | null;
  notes: string;
};

export type UserSettings = {
  fcMax: number | null;
  fcRest: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  startDate: string | null; // ISO yyyy-mm-dd, used to compute "current week"
};

export type AppData = {
  version: 1;
  settings: UserSettings;
  exerciseLogs: ExerciseLog[];
  weeklyLogs: WeeklyLog[];
};

export const EMPTY_DATA: AppData = {
  version: 1,
  settings: {
    fcMax: 185,
    fcRest: 60,
    currentWeightKg: 109,
    targetWeightKg: 95,
    startDate: null,
  },
  exerciseLogs: [],
  weeklyLogs: [],
};

export interface StorageAdapter {
  readonly kind: "local" | "supabase";
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
}

export type FamilyMember = {
  userId: string;
  displayName: string;
  joinedAt: string;
};

export type Family = {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  members: FamilyMember[];
};

export type FamilyActivity = {
  userId: string;
  displayName: string;
  type: "strength" | "cardio" | "weekly";
  sessionKey?: string;
  week: number;
  loggedAt: string;
};
