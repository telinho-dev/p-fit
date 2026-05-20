import type { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_DATA, type AppData, type StorageAdapter } from "./types";

// Postgres row shapes — mirror supabase/migrations/0001_init.sql
type SettingsRow = {
  user_id: string;
  fc_max: number | null;
  fc_rest: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  start_date: string | null;
  hydration_target_ml: number | null;
};

type ExerciseLogRow = {
  user_id: string;
  session_key: string;
  exercise_key: string;
  week: number;
  set_number: number;
  load: string;
  reps: string;
  notes: string;
};

type WeeklyLogRow = {
  user_id: string;
  week: number;
  weight_kg: number | null;
  waist_cm: number | null;
  sessions_done: number | null;
  cardios_done: number | null;
  protein_avg: number | null;
  sleep_avg: number | null;
  notes: string;
};

type DailyLogRow = {
  user_id: string;
  date: string;
  hydration_ml: number;
  creatine_done: boolean;
  protein_on_target: boolean;
  sleep_ok: boolean;
};

export class SupabaseStorageAdapter implements StorageAdapter {
  readonly kind = "supabase" as const;

  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async load(): Promise<AppData> {
    const [settings, exerciseLogs, weeklyLogs, dailyLogs] = await Promise.all([
      this.client.from("p_user_settings").select("*").eq("user_id", this.userId).maybeSingle(),
      this.client.from("p_exercise_logs").select("*").eq("user_id", this.userId),
      this.client.from("p_weekly_logs").select("*").eq("user_id", this.userId),
      this.client.from("p_daily_logs").select("*").eq("user_id", this.userId),
    ]);

    const data: AppData = structuredClone(EMPTY_DATA);

    const s = settings.data as SettingsRow | null;
    if (s) {
      data.settings = {
        fcMax: s.fc_max,
        fcRest: s.fc_rest,
        currentWeightKg: s.current_weight_kg,
        targetWeightKg: s.target_weight_kg,
        startDate: s.start_date,
        hydrationTargetMl: s.hydration_target_ml,
      };
    }

    const ex = (exerciseLogs.data ?? []) as ExerciseLogRow[];
    data.exerciseLogs = ex.map((r) => ({
      sessionKey: r.session_key,
      exerciseKey: r.exercise_key,
      week: r.week,
      setNumber: r.set_number,
      load: r.load,
      reps: r.reps,
      notes: r.notes,
    }));

    const wl = (weeklyLogs.data ?? []) as WeeklyLogRow[];
    data.weeklyLogs = wl.map((r) => ({
      week: r.week,
      weightKg: r.weight_kg,
      waistCm: r.waist_cm,
      sessionsDone: r.sessions_done,
      cardiosDone: r.cardios_done,
      proteinAvg: r.protein_avg,
      sleepAvg: r.sleep_avg,
      notes: r.notes,
    }));

    const dl = (dailyLogs.data ?? []) as DailyLogRow[];
    data.dailyLogs = dl.map((r) => ({
      date: r.date,
      hydrationMl: r.hydration_ml,
      creatineDone: r.creatine_done,
      proteinOnTarget: r.protein_on_target,
      sleepOk: r.sleep_ok,
    }));

    return data;
  }

  async save(data: AppData): Promise<void> {
    await Promise.all([
      this.client.from("p_user_settings").upsert({
        user_id: this.userId,
        fc_max: data.settings.fcMax,
        fc_rest: data.settings.fcRest,
        current_weight_kg: data.settings.currentWeightKg,
        target_weight_kg: data.settings.targetWeightKg,
        start_date: data.settings.startDate,
        hydration_target_ml: data.settings.hydrationTargetMl,
      } satisfies SettingsRow),
      data.exerciseLogs.length > 0
        ? this.client.from("p_exercise_logs").upsert(
            data.exerciseLogs.map(
              (l) =>
                ({
                  user_id: this.userId,
                  session_key: l.sessionKey,
                  exercise_key: l.exerciseKey,
                  week: l.week,
                  set_number: l.setNumber,
                  load: l.load,
                  reps: l.reps,
                  notes: l.notes,
                }) satisfies ExerciseLogRow,
            ),
          )
        : Promise.resolve(),
      data.weeklyLogs.length > 0
        ? this.client.from("p_weekly_logs").upsert(
            data.weeklyLogs.map(
              (w) =>
                ({
                  user_id: this.userId,
                  week: w.week,
                  weight_kg: w.weightKg,
                  waist_cm: w.waistCm,
                  sessions_done: w.sessionsDone,
                  cardios_done: w.cardiosDone,
                  protein_avg: w.proteinAvg,
                  sleep_avg: w.sleepAvg,
                  notes: w.notes,
                }) satisfies WeeklyLogRow,
            ),
          )
        : Promise.resolve(),
      data.dailyLogs.length > 0
        ? this.client.from("p_daily_logs").upsert(
            data.dailyLogs.map(
              (d) =>
                ({
                  user_id: this.userId,
                  date: d.date,
                  hydration_ml: d.hydrationMl,
                  creatine_done: d.creatineDone,
                  protein_on_target: d.proteinOnTarget,
                  sleep_ok: d.sleepOk,
                }) satisfies DailyLogRow,
            ),
          )
        : Promise.resolve(),
    ]);
  }
}
