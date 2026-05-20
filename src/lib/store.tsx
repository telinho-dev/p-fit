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
  type DailyLog,
  type ExerciseLog,
  type Family,
  type FamilyActivity,
  type FamilyMember,
  type LeaderboardEntry,
  type StorageAdapter,
  type UserSettings,
  type WeeklyLog,
} from "./storage/types";
import { LocalStorageAdapter } from "./storage/local";
import { SupabaseStorageAdapter } from "./storage/supabase";
import { supabase, isSupabaseConfigured } from "./supabase";
import { getISOWeek } from "./utils";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string; email: string };

type StoreContextValue = {
  data: AppData;
  ready: boolean;
  adapterKind: "local" | "supabase";
  auth: AuthState;
  migrationPending: AppData | null;
  confirmMigration: (accept: boolean) => Promise<void>;
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
  getDailyLog: (date: string) => DailyLog | undefined;
  upsertDailyLog: (log: DailyLog) => void;
  family: Family | null;
  familyActivity: FamilyActivity[];
  weeklyLeaderboard: LeaderboardEntry[];
  createFamily: (name: string, displayName: string) => Promise<string | null>;
  joinFamily: (inviteCode: string, displayName: string) => Promise<string | null>;
  leaveFamily: () => Promise<string | null>;
  refreshFamily: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [adapter, setAdapter] = useState<StorageAdapter>(() => new LocalStorageAdapter());
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [migrationPending, setMigrationPending] = useState<AppData | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyActivity, setFamilyActivity] = useState<FamilyActivity[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const writeTimer = useRef<number | null>(null);
  const pendingMigration = useRef<{ userId: string; email: string } | null>(null);

  const switchAdapter = useCallback((next: StorageAdapter) => {
    setAdapter(next);
    setReady(false);
    next.load().then((loaded) => {
      setData(loaded);
      setReady(true);
    });
  }, []);

  const refreshFamilyRef = useRef<(() => Promise<void>) | null>(null);

  const handleSignedIn = useCallback(
    async (userId: string, email: string, checkLocalData: boolean) => {
      setAuth({ status: "signed-in", userId, email });

      if (checkLocalData) {
        const localData = await new LocalStorageAdapter().load();
        const hasLocalData = localData.exerciseLogs.length > 0 || localData.weeklyLogs.length > 0;
        if (hasLocalData) {
          pendingMigration.current = { userId, email };
          setMigrationPending(localData);
          return;
        }
      }

      switchAdapter(new SupabaseStorageAdapter(supabase!, userId));
      refreshFamilyRef.current?.();
    },
    [switchAdapter],
  );

  const confirmMigration = useCallback(
    async (accept: boolean) => {
      const pending = pendingMigration.current;
      if (!pending || !supabase) return;
      const { userId } = pending;
      pendingMigration.current = null;

      if (accept && migrationPending) {
        const tempAdapter = new SupabaseStorageAdapter(supabase, userId);
        await tempAdapter.save(migrationPending);
      }

      setMigrationPending(null);
      switchAdapter(new SupabaseStorageAdapter(supabase!, userId));
      refreshFamilyRef.current?.();
    },
    [migrationPending, switchAdapter],
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuth({ status: "signed-out" });
      switchAdapter(new LocalStorageAdapter());
      return;
    }

    let initialCheckDone = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      initialCheckDone = true;
      if (session?.user) {
        handleSignedIn(session.user.id, session.user.email ?? "", false);
      } else {
        setAuth({ status: "signed-out" });
        switchAdapter(new LocalStorageAdapter());
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const checkLocal = initialCheckDone;
        handleSignedIn(session.user.id, session.user.email ?? "", checkLocal);
      } else {
        pendingMigration.current = null;
        setMigrationPending(null);
        setAuth({ status: "signed-out" });
        switchAdapter(new LocalStorageAdapter());
        setFamily(null);
        setFamilyActivity([]);
        setWeeklyLeaderboard([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [switchAdapter, handleSignedIn]);

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

  const resetData = useCallback<StoreContextValue["resetData"]>(
    () => mutate(() => structuredClone(EMPTY_DATA)),
    [mutate],
  );

  const getDailyLog = useCallback<StoreContextValue["getDailyLog"]>(
    (date) => data.dailyLogs.find((l) => l.date === date),
    [data.dailyLogs],
  );

  const upsertDailyLog = useCallback<StoreContextValue["upsertDailyLog"]>(
    (log) =>
      mutate((d) => {
        const i = d.dailyLogs.findIndex((l) => l.date === log.date);
        const next = d.dailyLogs.slice();
        if (i === -1) next.push(log);
        else next[i] = log;
        return { ...d, dailyLogs: next };
      }),
    [mutate],
  );

  const refreshFamily = useCallback(async (): Promise<void> => {
    if (!supabase || !isSupabaseConfigured) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberRows } = await supabase
      .from("p_family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .limit(1);

    if (!memberRows || memberRows.length === 0) {
      setFamily(null);
      setFamilyActivity([]);
      return;
    }

    const familyId = memberRows[0].family_id as string;

    const { data: familyRow } = await supabase
      .from("p_families")
      .select("id, name, owner_id, invite_code")
      .eq("id", familyId)
      .single();

    if (!familyRow) {
      setFamily(null);
      setFamilyActivity([]);
      return;
    }

    const { data: membersRows } = await supabase
      .from("p_family_members")
      .select("user_id, display_name, joined_at")
      .eq("family_id", familyId);

    const members: FamilyMember[] = (membersRows ?? []).map((m) => ({
      userId: m.user_id as string,
      displayName: m.display_name as string,
      joinedAt: m.joined_at as string,
    }));

    setFamily({
      id: familyRow.id as string,
      name: familyRow.name as string,
      ownerId: familyRow.owner_id as string,
      inviteCode: familyRow.invite_code as string,
      members,
    });

    const currentWeek = getISOWeek();
    const otherUserIds = members.map((m) => m.userId).filter((id) => id !== user.id);

    if (otherUserIds.length > 0) {
      const prevWeek = currentWeek > 1 ? currentWeek - 1 : 52;

      const [{ data: exLogs }, { data: wkLogs }] = await Promise.all([
        supabase
          .from("p_exercise_logs")
          .select("user_id, session_key, week, updated_at")
          .in("user_id", otherUserIds)
          .in("week", [currentWeek, prevWeek])
          .eq("set_number", 0)
          .order("updated_at", { ascending: false }),
        supabase
          .from("p_weekly_logs")
          .select("user_id, week, updated_at")
          .in("user_id", otherUserIds)
          .in("week", [currentWeek, prevWeek])
          .order("updated_at", { ascending: false }),
      ]);

      const displayNameMap = new Map(members.map((m) => [m.userId, m.displayName]));
      const seen = new Set<string>();
      const activities: FamilyActivity[] = [];

      for (const row of exLogs ?? []) {
        const key = `${row.user_id as string}-strength-${row.session_key as string}-${row.week as number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const sessionType = (row.session_key as string).includes("lower") || (row.session_key as string).includes("upper") ? "strength" : "cardio";
        activities.push({
          userId: row.user_id as string,
          displayName: displayNameMap.get(row.user_id as string) ?? "",
          type: sessionType,
          sessionKey: row.session_key as string,
          week: row.week as number,
          loggedAt: row.updated_at as string,
        });
      }

      for (const row of wkLogs ?? []) {
        const key = `${row.user_id as string}-weekly-${row.week as number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        activities.push({
          userId: row.user_id as string,
          displayName: displayNameMap.get(row.user_id as string) ?? "",
          type: "weekly",
          week: row.week as number,
          loggedAt: row.updated_at as string,
        });
      }

      activities.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
      setFamilyActivity(activities);
    } else {
      setFamilyActivity([]);
    }

    const allUserIds = members.map((m) => m.userId);
    const { data: leaderRows } = await supabase
      .from("p_exercise_logs")
      .select("user_id, session_key")
      .in("user_id", allUserIds)
      .eq("week", currentWeek)
      .eq("set_number", 1);

    const sessionCounts = new Map<string, Set<string>>();
    const cardioCounts = new Map<string, Set<string>>();

    for (const row of leaderRows ?? []) {
      const uid = row.user_id as string;
      const sk = row.session_key as string;
      const isCardio = sk.includes("cardio") || sk.includes("zona");
      if (isCardio) {
        if (!cardioCounts.has(uid)) cardioCounts.set(uid, new Set());
        cardioCounts.get(uid)!.add(sk);
      } else {
        if (!sessionCounts.has(uid)) sessionCounts.set(uid, new Set());
        sessionCounts.get(uid)!.add(sk);
      }
    }

    const leaderboard: LeaderboardEntry[] = members
      .map((m) => ({
        userId: m.userId,
        displayName: m.displayName,
        sessionsCount: sessionCounts.get(m.userId)?.size ?? 0,
        cardioCount: cardioCounts.get(m.userId)?.size ?? 0,
        totalCount: (sessionCounts.get(m.userId)?.size ?? 0) + (cardioCounts.get(m.userId)?.size ?? 0),
        isCurrentUser: m.userId === user.id,
      }))
      .sort((a, b) => b.totalCount - a.totalCount || a.displayName.localeCompare(b.displayName));

    setWeeklyLeaderboard(leaderboard);
  }, []);

  refreshFamilyRef.current = refreshFamily;

  const createFamily = useCallback(async (name: string, displayName: string): Promise<string | null> => {
    if (!supabase) return "Supabase não configurado.";
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Usuário não autenticado.";

    const { data: familyRow, error: familyErr } = await supabase
      .from("p_families")
      .insert({ name, owner_id: user.id })
      .select("id")
      .single();

    if (familyErr || !familyRow) return familyErr?.message ?? "Erro ao criar família.";

    const { error: memberErr } = await supabase
      .from("p_family_members")
      .insert({ family_id: familyRow.id, user_id: user.id, display_name: displayName });

    if (memberErr) return memberErr.message;

    await refreshFamily();
    return null;
  }, [refreshFamily]);

  const joinFamily = useCallback(async (inviteCode: string, displayName: string): Promise<string | null> => {
    if (!supabase) return "Supabase não configurado.";
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Usuário não autenticado.";

    const { data: familyRow, error: findErr } = await supabase
      .from("p_families")
      .select("id")
      .eq("invite_code", inviteCode.trim().toLowerCase())
      .single();

    if (findErr || !familyRow) return "Código de convite inválido.";

    const { error: memberErr } = await supabase
      .from("p_family_members")
      .insert({ family_id: familyRow.id, user_id: user.id, display_name: displayName });

    if (memberErr) return memberErr.message;

    await refreshFamily();
    return null;
  }, [refreshFamily]);

  const leaveFamily = useCallback(async (): Promise<string | null> => {
    if (!supabase) return "Supabase não configurado.";
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Usuário não autenticado.";
    if (!family) return "Sem família para sair.";

    const { error } = await supabase
      .from("p_family_members")
      .delete()
      .eq("family_id", family.id)
      .eq("user_id", user.id);

    if (error) return error.message;

    setFamily(null);
    setFamilyActivity([]);
    return null;
  }, [family]);

  const value = useMemo<StoreContextValue>(
    () => ({
      data,
      ready,
      adapterKind: adapter.kind,
      auth,
      migrationPending,
      confirmMigration,
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
      getDailyLog,
      upsertDailyLog,
      family,
      familyActivity,
      weeklyLeaderboard,
      createFamily,
      joinFamily,
      leaveFamily,
      refreshFamily,
    }),
    [
      data, ready, adapter.kind, auth,
      migrationPending, confirmMigration,
      signIn, signUp, signOut,
      updateSettings, upsertExerciseLog, getExerciseLogs,
      upsertWeeklyLog, getWeeklyLog, replaceData, resetData,
      getDailyLog, upsertDailyLog,
      family, familyActivity, weeklyLeaderboard, createFamily, joinFamily, leaveFamily, refreshFamily,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
