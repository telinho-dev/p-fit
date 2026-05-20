import { useStore } from "@/lib/store";

export function MigrationDialog() {
  const { migrationPending, confirmMigration } = useStore();

  if (!migrationPending) return null;

  const trainings = migrationPending.exerciseLogs.length;
  const weeks = migrationPending.weeklyLogs.length;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="migration-title"
        className="w-full max-w-sm rounded-2xl border border-(--color-line) bg-(--color-panel) p-6 shadow-xl"
      >
        <h2
          id="migration-title"
          className="font-display text-base font-bold text-(--color-ink)"
        >
          Você tem dados locais
        </h2>

        <p className="mt-2 text-sm text-(--color-ink-dim)">
          Encontramos{" "}
          <span className="font-semibold text-(--color-ink)">{trainings} registro{trainings !== 1 ? "s" : ""} de treino</span>
          {" "}e{" "}
          <span className="font-semibold text-(--color-ink)">{weeks} semana{weeks !== 1 ? "s" : ""}</span>
          {" "}salvas localmente. Importar para sua conta na nuvem?
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => confirmMigration(true)}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-(--color-flame) font-display text-sm font-bold text-(--color-ink) transition-all hover:bg-(--color-flame-2) active:scale-[0.98]"
          >
            Importar
          </button>
          <button
            onClick={() => confirmMigration(false)}
            className="inline-flex h-11 w-full items-center justify-center rounded-full font-display text-sm font-semibold text-(--color-ink-mute) transition-colors hover:text-(--color-ink) active:scale-[0.98]"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
