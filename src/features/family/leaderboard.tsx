import { useStore } from "@/lib/store";
import { getISOWeek } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/storage/types";

const AVATAR_COLORS = [
  "#ff5722", "#5ad6ff", "#b5ea3a", "#a78bfa", "#f59e0b", "#34d399",
];

const RANK_COLORS: Record<number, string> = {
  1: "var(--color-flame)",
  2: "var(--color-cyan)",
  3: "var(--color-lime)",
};

function MemberAvatar({ displayName, userId }: { displayName: string; userId: string }) {
  const colorIndex = userId.charCodeAt(0) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIndex];
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="grid place-items-center h-9 w-9 rounded-full shrink-0 font-display text-[14px] font-bold"
      style={{ backgroundColor: `${color}24`, color }}
    >
      {initial}
    </div>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const rankColor = RANK_COLORS[rank] ?? "var(--color-ink-mute)";
  const rankLabel = String(rank).padStart(2, "0");

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-(--color-panel) px-4 py-3",
        entry.isCurrentUser
          ? "border-(--color-flame)/30"
          : "border-(--color-line)",
      )}
    >
      <span
        className="stat-num text-[20px] w-7 shrink-0 tabular-nums"
        style={{ color: rankColor }}
      >
        {rankLabel}
      </span>

      <MemberAvatar displayName={entry.displayName} userId={entry.userId} />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-display text-[14px] text-(--color-ink) truncate",
            entry.isCurrentUser ? "font-bold" : "font-semibold",
          )}
        >
          {entry.displayName}
        </p>
        {entry.totalCount === 0 ? (
          <p className="font-display text-[11px] text-(--color-ink-mute)">Nenhum treino ainda</p>
        ) : (
          <p className="font-display text-[11px] text-(--color-ink-mute)">
            {entry.sessionsCount}F · {entry.cardioCount}C
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span
          className="stat-num text-[22px] leading-none"
          style={{ color: rankColor }}
        >
          {entry.totalCount}
        </span>
        <span className="micro-label text-(--color-ink-mute)">treinos</span>
      </div>
    </li>
  );
}

export function WeeklyLeaderboard() {
  const { weeklyLeaderboard } = useStore();
  const week = getISOWeek();

  if (weeklyLeaderboard.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="display text-[20px] text-(--color-ink)">Semana W{week}</h2>
        <span className="micro-label text-(--color-ink-mute)">treinos</span>
      </div>

      <ul className="space-y-2">
        {weeklyLeaderboard.map((entry, index) => (
          <LeaderboardRow key={entry.userId} entry={entry} rank={index + 1} />
        ))}
      </ul>
    </div>
  );
}
