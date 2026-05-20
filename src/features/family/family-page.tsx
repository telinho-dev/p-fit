import { useState } from "react";
import { Copy, Check, Loader, Users, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { WeeklyLeaderboard } from "./leaderboard";

export function FamilyPage() {
  const { family, createFamily, joinFamily, auth } = useStore();

  if (auth.status !== "signed-in") {
    return (
      <div className="space-y-6">
        <header className="space-y-1 pt-1 px-1">
          <p className="micro-label text-(--color-ink-mute)">Comunidade</p>
          <h1 className="display text-[36px] leading-[1] text-(--color-ink)">Família</h1>
        </header>
        <div className="rounded-2xl border border-dashed border-(--color-line) bg-(--color-panel)/60 px-4 py-4">
          <p className="font-display text-[13px] text-(--color-ink-mute)">
            Faça login para criar ou entrar em uma família.
          </p>
        </div>
      </div>
    );
  }

  if (family) {
    return <FamilyView />;
  }

  return <NoFamilyView onCreateFamily={createFamily} onJoinFamily={joinFamily} />;
}

function NoFamilyView({
  onCreateFamily,
  onJoinFamily,
}: {
  onCreateFamily: (name: string, displayName: string) => Promise<string | null>;
  onJoinFamily: (inviteCode: string, displayName: string) => Promise<string | null>;
}) {
  const [mode, setMode] = useState<"none" | "create" | "join">("none");

  return (
    <div className="space-y-6">
      <header className="space-y-1 pt-1 px-1">
        <p className="micro-label text-(--color-ink-mute)">Comunidade</p>
        <h1 className="display text-[36px] leading-[1] text-(--color-ink)">Família</h1>
      </header>

      <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-(--color-line) flex gap-1">
          <button
            onClick={() => setMode(mode === "create" ? "none" : "create")}
            className={cn(
              "flex-1 rounded-xl py-2 font-display text-[13px] font-semibold transition-colors",
              mode === "create"
                ? "bg-(--color-panel-2) text-(--color-ink)"
                : "text-(--color-ink-mute) hover:text-(--color-ink-dim)",
            )}
          >
            Criar família
          </button>
          <button
            onClick={() => setMode(mode === "join" ? "none" : "join")}
            className={cn(
              "flex-1 rounded-xl py-2 font-display text-[13px] font-semibold transition-colors",
              mode === "join"
                ? "bg-(--color-panel-2) text-(--color-ink)"
                : "text-(--color-ink-mute) hover:text-(--color-ink-dim)",
            )}
          >
            Entrar com código
          </button>
        </div>

        {mode === "create" && <CreateFamilyForm onSubmit={onCreateFamily} />}
        {mode === "join" && <JoinFamilyForm onSubmit={onJoinFamily} />}

        {mode === "none" && (
          <div className="px-4 py-5 text-center">
            <div className="grid place-items-center h-12 w-12 rounded-2xl bg-(--color-panel-2) text-(--color-ink-mute) mx-auto mb-3">
              <Users size={22} />
            </div>
            <p className="font-display text-[13px] text-(--color-ink-mute)">
              Crie uma família ou entre com um código de convite para acompanhar os treinos juntos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateFamilyForm({ onSubmit }: { onSubmit: (name: string, displayName: string) => Promise<string | null> }) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!name.trim() || !displayName.trim()) return;
    setLoading(true);
    setError(null);
    const err = await onSubmit(name.trim(), displayName.trim());
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="family-name">Nome da família</Label>
        <Input
          id="family-name"
          placeholder="ex: Família Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="create-display-name">Como quer ser chamado?</Label>
        <Input
          id="create-display-name"
          placeholder="ex: Pai, Mãe, João..."
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
        />
      </div>
      {error && <p className="font-display text-[12px] text-(--color-rose) leading-snug">{error}</p>}
      <button
        onClick={handle}
        disabled={loading || !name.trim() || !displayName.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-(--color-flame) text-(--color-ink) py-3 font-display text-[14px] font-bold transition-opacity disabled:opacity-40 active:opacity-80"
      >
        {loading ? <Loader size={16} className="animate-spin" /> : <Users size={16} />}
        Criar família
      </button>
    </div>
  );
}

function JoinFamilyForm({ onSubmit }: { onSubmit: (inviteCode: string, displayName: string) => Promise<string | null> }) {
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!inviteCode.trim() || !displayName.trim()) return;
    setLoading(true);
    setError(null);
    const err = await onSubmit(inviteCode.trim(), displayName.trim());
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="invite-code">Código de convite</Label>
        <Input
          id="invite-code"
          placeholder="ex: a1b2c3d4"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="join-display-name">Como quer ser chamado?</Label>
        <Input
          id="join-display-name"
          placeholder="ex: Pai, Mãe, João..."
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
        />
      </div>
      {error && <p className="font-display text-[12px] text-(--color-rose) leading-snug">{error}</p>}
      <button
        onClick={handle}
        disabled={loading || !inviteCode.trim() || !displayName.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-(--color-flame) text-(--color-ink) py-3 font-display text-[14px] font-bold transition-opacity disabled:opacity-40 active:opacity-80"
      >
        {loading ? <Loader size={16} className="animate-spin" /> : <Users size={16} />}
        Entrar na família
      </button>
    </div>
  );
}

function FamilyView() {
  const { family, auth, leaveFamily } = useStore();
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  if (!family) return null;

  const isOwner = auth.status === "signed-in" && auth.userId === family.ownerId;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    setLeaving(true);
    setLeaveError(null);
    const err = await leaveFamily();
    setLeaving(false);
    if (err) setLeaveError(err);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1 pt-1 px-1">
        <p className="micro-label text-(--color-ink-mute)">Comunidade</p>
        <h1 className="display text-[36px] leading-[1] text-(--color-ink)">Família</h1>
      </header>

      <div className="space-y-2 rounded-2xl border border-(--color-line) bg-(--color-panel) px-4 py-4">
        <p className="micro-label text-(--color-ink-mute)">Nome</p>
        <p className="display text-[22px] text-(--color-ink) leading-snug">{family.name}</p>
      </div>

      {isOwner && (
        <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="micro-label text-(--color-ink-mute) mb-2">Código de convite</p>
            <div className="flex items-center gap-2 rounded-xl bg-(--color-panel-2) px-3 py-2.5">
              <span className="flex-1 font-mono text-[18px] font-bold tracking-widest text-(--color-ink) select-all">
                {family.inviteCode}
              </span>
              <button
                onClick={handleCopy}
                aria-label="Copiar código"
                className="grid place-items-center h-8 w-8 rounded-lg bg-(--color-panel) text-(--color-ink-dim) hover:text-(--color-ink) transition-colors shrink-0"
              >
                {copied ? <Check size={15} className="text-(--color-lime)" /> : <Copy size={15} />}
              </button>
            </div>
          </div>
          <p className="px-4 pb-3 font-display text-[11px] text-(--color-ink-mute)">
            Compartilhe este código com os membros da família para que entrem.
          </p>
        </div>
      )}

      <WeeklyLeaderboard />

      <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-(--color-line)">
          <p className="micro-label text-(--color-ink-mute)">Membros</p>
        </div>
        <ul className="divide-y divide-(--color-line)">
          {family.members.map((member) => (
            <li key={member.userId} className="flex items-center gap-3 px-4 py-3">
              <MemberAvatar displayName={member.displayName} userId={member.userId} />
              <div className="flex-1 min-w-0">
                <p className="font-display text-[14px] font-semibold text-(--color-ink) truncate">
                  {member.displayName}
                  {member.userId === family.ownerId && (
                    <span className="ml-1.5 font-display text-[10px] font-semibold text-(--color-flame) uppercase tracking-wider">
                      admin
                    </span>
                  )}
                </p>
                <p className="font-display text-[11px] text-(--color-ink-mute)">
                  entrou {formatRelativeDate(member.joinedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {leaveError && (
        <p className="font-display text-[12px] text-(--color-rose) px-1">{leaveError}</p>
      )}

      <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) px-4 py-3">
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="flex items-center gap-2 font-display text-[13px] font-semibold text-(--color-rose) disabled:opacity-50 transition-opacity"
        >
          {leaving ? <Loader size={14} className="animate-spin" /> : <LogOut size={14} />}
          Sair da família
        </button>
      </div>
    </div>
  );
}

const AVATAR_COLORS = [
  "#ff5722", "#5ad6ff", "#b5ea3a", "#a78bfa", "#f59e0b", "#34d399",
];

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

function formatRelativeDate(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "agora mesmo";
  if (diffMins < 60) return `há ${diffMins}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
