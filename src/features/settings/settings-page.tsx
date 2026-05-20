import { useState } from "react";
import { LogIn, LogOut, UserRound, Loader } from "lucide-react";
import { useStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DataCard } from "@/features/data/data-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { auth, signIn, signUp, signOut, adapterKind, data, updateSettings } = useStore();

  return (
    <div className="space-y-6">
      <header className="space-y-1 pt-1 px-1">
        <p className="micro-label text-(--color-ink-mute)">Conta</p>
        <h1 className="display text-[36px] leading-[1] text-(--color-ink)">Perfil</h1>
      </header>

      {/* Sync status */}
      <div className="flex items-center gap-3 rounded-2xl border border-(--color-line) bg-(--color-panel) px-4 py-3.5">
        <div
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            adapterKind === "supabase" ? "bg-(--color-lime)" : "bg-(--color-ink-mute)",
          )}
        />
        <div>
          <p className="font-display text-[14px] font-semibold text-(--color-ink)">
            {adapterKind === "supabase" ? "Sincronizando com Supabase" : "Dados locais"}
          </p>
          <p className="font-display text-[12px] text-(--color-ink-mute)">
            {adapterKind === "supabase"
              ? "Seus dados salvam na nuvem automaticamente."
              : "Faça login para sincronizar entre dispositivos."}
          </p>
        </div>
      </div>

      {/* Auth section */}
      {!isSupabaseConfigured ? (
        <div className="rounded-2xl border border-dashed border-(--color-line) bg-(--color-panel)/60 px-4 py-4">
          <p className="font-display text-[13px] text-(--color-ink-mute)">
            Configure <code className="font-mono text-[12px]">VITE_SUPABASE_URL</code> e{" "}
            <code className="font-mono text-[12px]">VITE_SUPABASE_ANON_KEY</code> no <code className="font-mono text-[12px]">.env.local</code> para habilitar sync.
          </p>
        </div>
      ) : auth.status === "loading" ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={20} className="text-(--color-ink-mute) animate-spin" />
        </div>
      ) : auth.status === "signed-in" ? (
        <SignedInCard email={auth.email} onSignOut={signOut} />
      ) : (
        <AuthForm onSignIn={signIn} onSignUp={signUp} />
      )}

      {/* Daily goals */}
      <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden">
        <div className="px-4 py-3 border-b border-(--color-line)">
          <p className="font-display text-[14px] font-semibold text-(--color-ink)">Metas Diárias</p>
        </div>
        <div className="px-4 py-4 space-y-1.5">
          <Label htmlFor="hydration-target">Meta de hidratação (mL)</Label>
          <Input
            id="hydration-target"
            type="number"
            placeholder="2500"
            value={data.settings.hydrationTargetMl ?? ""}
            onChange={(e) =>
              updateSettings({ hydrationTargetMl: Number(e.target.value) || null })
            }
          />
        </div>
      </div>

      {/* Data management */}
      <DataCard />
    </div>
  );
}

function SignedInCard({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await onSignOut();
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-(--color-lime)/15 text-(--color-lime) shrink-0">
          <UserRound size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[13px] font-semibold text-(--color-ink) truncate">{email}</p>
          <p className="font-display text-[11px] text-(--color-ink-mute)">conectado</p>
        </div>
      </div>
      <div className="border-t border-(--color-line) px-4 py-3">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center gap-2 font-display text-[13px] font-semibold text-(--color-rose) disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <LogOut size={14} />}
          Sair
        </button>
      </div>
    </div>
  );
}

function AuthForm({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handle = async (action: "signin" | "signup") => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const err = action === "signin" ? await onSignIn(email, password) : await onSignUp(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-(--color-line) flex gap-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className={cn(
              "flex-1 rounded-xl py-2 font-display text-[13px] font-semibold transition-colors",
              mode === m
                ? "bg-(--color-panel-2) text-(--color-ink)"
                : "text-(--color-ink-mute) hover:text-(--color-ink-dim)",
            )}
          >
            {m === "signin" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">E-mail</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="auth-password">Senha</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle(mode)}
          />
        </div>

        {error && (
          <p className="font-display text-[12px] text-(--color-rose) leading-snug">{error}</p>
        )}

        <button
          onClick={() => handle(mode)}
          disabled={loading || !email || !password}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-(--color-flame) text-(--color-ink) py-3 font-display text-[14px] font-bold transition-opacity disabled:opacity-40 active:opacity-80"
        >
          {loading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
      </div>
    </div>
  );
}
