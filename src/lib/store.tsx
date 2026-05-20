import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  EMPTY_DATA,
  type AppData,
  type ExerciseLog,
  type StorageAdapter,
  type UserSettings,
  type WeeklyLog,
} from "./storage/types";
import { LocalStorageAdapter } from "./storage/local";
import { SupabaseStorageAdapter } from "./storage/supabase";
import { supabase, isSupabaseConfigured } from "./supabase";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string; email: string };

type StoreContextValue = {
  data: AppData;
  ready: boolean;
  adapterKind: "local" | "supabase";
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => void;
  upsertExerciseLog: (log: ExerciseLog) => void;
  getExerciseLogs: (sessionKey: string, exerciseKey: string, week: number) => ExerciseLog[];
  upsertWeeklyLog: (log: WeeklyLog) => void;
  getWeeklyLog: (week: number) => WeeklyLog | undefined;
  replaceData: (next: AppData) => void;
  resetData: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [adapter, setAdapter] = useState<StorageAdapter>(() => new LocalStorageAdapter());
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const writeTimer = useRef<number | null>(null);

  // Switch adapter and reload data whenever auth changes
  const switchAdapter = useCallback((next: StorageAdapter) => {
    setAdapter(next);
    setReady(false);
    next.load().then((loaded) => {
      setData(loaded);
      setReady(true);
    });
  }, []);

  // Wire Supabase auth listener (or resolve immediately if not configured)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuth({ status: "signed-out" });
      switchAdapter(new LocalStorageAdapter());
      return;
    }

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuth({ status: "signed-in", userId: session.user.id, email: session.user.email ?? "" });
        switchAdapter(new SupabaseStorageAdapter(supabase!, session.user.id));
      } else {
        setAuth({ status: "signed-out" });
        switchAdapter(new LocalStorageAdapter());
      }
    });

    // Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth({ status: "signed-in", userId: session.user.id, email: session.user.email ?? "" });
        switchAdapter(new SupabaseStorageAdapter(supabase!, session.user.id));
      } else {
        setAuth({ status: "signed-out" });
        switchAdapter(new LocalStorageAdapter());
      }
    });

    return () => subscription.unsubscribe();
  }, [switchAdapter]);

  const schedulePersist = useCallback(
    (next: AppData) => {
      if (writeTimer.current) window.clearTimeout(writeTimer.current);
      writeTimer.current = window.setTimeout(() => {
        adapter.save(next);
      }, 200);
    },
    [adapter],
  );

  const mutate = useCallback(
    (fn: (prev: AppData) => AppData) => {
      setData((prev) => {
        const next = fn(prev);
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist],
  );

  // Auth actions — return error message or null
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return "Supabase não configurado.";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return "Supabase não configurado.";
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const updateSettings = useCallback<StoreContextValue["updateSettings"]>(
    (patch) => mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [mutate],
  );

  const upsertExerciseLog = useCallback<StoreContextValue["upsertExerciseLog"]>(
    (log) =>
      mutate((d) => {
        const i = d.exerciseLogs.findIndex(
          (l) =>
            l.sessionKey === log.sessionKey &&
            l.exerciseKey === log.exerciseKey &&
            l.week === log.week &&
            l.setNumber === log.setNumber,
        );
        const next = d.exerciseLogs.slice();
        if (i === -1) next.push(log);
        else next[i] = log;
        return { ...d, exerciseLogs: next };
      }),
    [mutate],
  );

  const getExerciseLogs = useCallback<StoreContextValue["getExerciseLogs"]>(
    (sessionKey, exerciseKey, week) =>
      data.exerciseLogs
        .filter((l) => l.sessionKey === sessionKey && l.exerciseKey === exerciseKey && l.week === week)
        .sort((a, b) => a.setNumber - b.setNumber),
    [data.exerciseLogs],
  );

  const upsertWeeklyLog = useCallback<StoreContextValue["upsertWeeklyLog"]>(
    (log) =>
      mutate((d) => {
        const i = d.weeklyLogs.findIndex((l) => l.week === log.week);
        const next = d.weeklyLogs.slice();
        if (i === -1) next.push(log);
        else next[i] = log;
        return { ...d, weeklyLogs: next };
      }),
    [mutate],
  );

  const getWeeklyLog = useCallback<StoreContextValue["getWeeklyLog"]>(
    (week) => data.weeklyLogs.find((l) => l.week === week),
    [data.weeklyLogs],
  );

  const replaceData = useCallback<StoreContextValue["replaceData"]>(
    (next) => mutate(() => structuredClone(next)),
    [mutate],
  );

  const resetData = useCallback<StoreContextValue["resetData"]>(() => mutate(() => structuredClone(EMPTY_DATA)), [mutate]);

  const value = useMemo<StoreContextValue>(
    () => ({
      data,
      ready,
      adapterKind: adapter.kind,
      auth,
      signIn,
      signUp,
      signOut,
      updateSettings,
      upsertExerciseLog,
      getExerciseLogs,
      upsertWeeklyLog,
      getWeeklyLog,
      replaceData,
      resetData,
    }),
    [
      data, ready, adapter.kind, auth,
      signIn, signUp, signOut,
      updateSettings, upsertExerciseLog, getExerciseLogs,
      upsertWeeklyLog, getWeeklyLog, replaceData, resetData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
