import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Camera, Check, Loader, TriangleAlert, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { getISOWeek } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ImportResult, ImportedExercise } from "@/lib/storage/types";

type PageState = "idle" | "analyzing" | "confirm" | "saved";

type SessionKey = "lower-a" | "upper-a" | "lower-b" | "upper-b";

const SESSION_LABELS: Record<SessionKey, string> = {
  "lower-a": "Lower A",
  "upper-a": "Upper A",
  "lower-b": "Lower B",
  "upper-b": "Upper B",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ImportPage() {
  const navigate = useNavigate();
  const { upsertExerciseLog } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<PageState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [editedSession, setEditedSession] = useState<SessionKey>("lower-a");
  const [editedWeek, setEditedWeek] = useState<number>(getISOWeek());
  const [editedExercises, setEditedExercises] = useState<ImportedExercise[]>([]);
  const [editedDuration, setEditedDuration] = useState<string>("");
  const [editedDistance, setEditedDistance] = useState<string>("");
  const [editedHrAvg, setEditedHrAvg] = useState<string>("");
  const [editedHrMax, setEditedHrMax] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setState("analyzing");
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/import-activity", { method: "POST", body: formData });
      const json = (await res.json()) as { ok: boolean; data?: ImportResult; error?: string };

      if (!json.ok || !json.data) {
        setError(json.error ?? "Erro ao analisar a imagem.");
        setState("idle");
        return;
      }

      const data = json.data;
      setResult(data);
      setEditedSession((data.session as SessionKey) ?? "lower-a");
      setEditedWeek(data.week ?? getISOWeek());
      setEditedExercises(
        (data.exercises ?? []).map((ex) => ({
          name: ex.name,
          sets: ex.sets.map((s) => ({ load: s.load, reps: s.reps })),
        })),
      );
      if (data.cardio) {
        setEditedDuration(String(data.cardio.durationMin ?? ""));
        setEditedDistance(data.cardio.distanceKm != null ? String(data.cardio.distanceKm) : "");
        setEditedHrAvg(data.cardio.hrAvg != null ? String(data.cardio.hrAvg) : "");
        setEditedHrMax(data.cardio.hrMax != null ? String(data.cardio.hrMax) : "");
      }
      setState("confirm");
    } catch {
      setError("Falha ao conectar com o servidor.");
      setState("idle");
    }
  };

  const handleSaveStrength = () => {
    for (const ex of editedExercises) {
      const exerciseKey = slugify(ex.name);
      ex.sets.forEach((s, idx) => {
        upsertExerciseLog({
          sessionKey: editedSession,
          exerciseKey,
          week: editedWeek,
          setNumber: idx + 1,
          load: s.load != null ? String(s.load) : "",
          reps: s.reps != null ? String(s.reps) : "",
          notes: "",
        });
      });
    }
    setState("saved");
  };

  const handleSaveCardio = () => {
    showToast("Treino cardio registrado!");
    setState("saved");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const resetAll = () => {
    setState("idle");
    setFile(null);
    setPreview(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1 pt-1 px-1">
        <p className="micro-label text-(--color-ink-mute)">Importar</p>
        <h1 className="display text-[36px] leading-[1] text-(--color-ink)">Via print</h1>
      </header>

      {state === "idle" && (
        <IdleState
          fileInputRef={fileInputRef}
          preview={preview}
          error={error}
          onFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
          hasFile={file !== null}
        />
      )}

      {state === "analyzing" && <AnalyzingState />}

      {state === "confirm" && result && (
        <ConfirmState
          result={result}
          editedSession={editedSession}
          editedWeek={editedWeek}
          editedExercises={editedExercises}
          editedDuration={editedDuration}
          editedDistance={editedDistance}
          editedHrAvg={editedHrAvg}
          editedHrMax={editedHrMax}
          onSessionChange={setEditedSession}
          onWeekChange={setEditedWeek}
          onExercisesChange={setEditedExercises}
          onDurationChange={setEditedDuration}
          onDistanceChange={setEditedDistance}
          onHrAvgChange={setEditedHrAvg}
          onHrMaxChange={setEditedHrMax}
          onSaveStrength={handleSaveStrength}
          onSaveCardio={handleSaveCardio}
        />
      )}

      {state === "saved" && (
        <SavedState onImportAnother={resetAll} onGoToStrength={() => navigate("/strength")} />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-(--color-panel) border border-(--color-line) px-5 py-3 font-display text-[13px] font-semibold text-(--color-ink) shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function IdleState({
  fileInputRef,
  preview,
  error,
  onFileChange,
  onAnalyze,
  hasFile,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  hasFile: boolean;
}) {
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed border-(--color-line) bg-(--color-panel)/60 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors active:bg-(--color-panel)",
          preview ? "p-3" : "px-6 py-12",
        )}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onFileChange}
        />

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded-xl"
          />
        ) : (
          <>
            <div className="grid place-items-center h-16 w-16 rounded-2xl bg-(--color-panel-2) text-(--color-ink-mute)">
              <Camera size={28} />
            </div>
            <div className="text-center space-y-1">
              <p className="font-display text-[15px] font-semibold text-(--color-ink)">
                Arraste um print aqui ou toque para selecionar
              </p>
              <p className="font-display text-[12px] text-(--color-ink-mute)">
                Garmin, Strava, Apple Fitness, etc.
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-(--color-rose)/30 bg-(--color-rose)/8 px-4 py-3">
          <TriangleAlert size={15} className="text-(--color-rose) shrink-0 mt-0.5" />
          <p className="font-display text-[13px] text-(--color-rose) leading-snug">{error}</p>
        </div>
      )}

      {hasFile && (
        <button
          onClick={onAnalyze}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-(--color-flame) text-(--color-ink) py-4 font-display text-[15px] font-bold transition-opacity active:opacity-80"
        >
          <Upload size={17} />
          Analisar
        </button>
      )}
    </div>
  );
}

function AnalyzingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Loader size={32} className="text-(--color-ink-mute) animate-spin" />
      <p className="font-display text-[15px] font-semibold text-(--color-ink-mute)">
        Analisando screenshot...
      </p>
    </div>
  );
}

function ConfirmState({
  result,
  editedSession,
  editedWeek,
  editedExercises,
  editedDuration,
  editedDistance,
  editedHrAvg,
  editedHrMax,
  onSessionChange,
  onWeekChange,
  onExercisesChange,
  onDurationChange,
  onDistanceChange,
  onHrAvgChange,
  onHrMaxChange,
  onSaveStrength,
  onSaveCardio,
}: {
  result: ImportResult;
  editedSession: SessionKey;
  editedWeek: number;
  editedExercises: ImportedExercise[];
  editedDuration: string;
  editedDistance: string;
  editedHrAvg: string;
  editedHrMax: string;
  onSessionChange: (s: SessionKey) => void;
  onWeekChange: (w: number) => void;
  onExercisesChange: (exs: ImportedExercise[]) => void;
  onDurationChange: (v: string) => void;
  onDistanceChange: (v: string) => void;
  onHrAvgChange: (v: string) => void;
  onHrMaxChange: (v: string) => void;
  onSaveStrength: () => void;
  onSaveCardio: () => void;
}) {
  const confidencePct = Math.round(result.confidence * 100);
  const lowConfidence = result.confidence < 0.7;

  const updateExerciseName = (idx: number, name: string) => {
    const updated = editedExercises.map((ex, i) => (i === idx ? { ...ex, name } : ex));
    onExercisesChange(updated);
  };

  const updateSetValue = (
    exIdx: number,
    setIdx: number,
    field: "load" | "reps",
    value: string,
  ) => {
    const parsed = value === "" ? null : Number(value);
    const updated = editedExercises.map((ex, i) => {
      if (i !== exIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, j) =>
          j === setIdx ? { ...s, [field]: parsed } : s,
        ),
      };
    });
    onExercisesChange(updated);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="micro-label text-(--color-ink-mute)">Resultado da análise</span>
        <span
          className={cn(
            "font-display text-[12px] font-semibold px-2.5 py-1 rounded-full",
            lowConfidence
              ? "bg-(--color-flame)/15 text-(--color-flame)"
              : "bg-(--color-lime)/15 text-(--color-lime)",
          )}
        >
          {confidencePct}% confiança
        </span>
      </div>

      {lowConfidence && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <TriangleAlert size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="font-display text-[13px] text-amber-400 leading-snug">
            Revise os dados — pode haver erros
          </p>
        </div>
      )}

      {result.notes && (
        <p className="font-display text-[12px] text-(--color-ink-mute) leading-snug px-1">
          {result.notes}
        </p>
      )}

      {result.type === "strength" && (
        <StrengthConfirm
          editedSession={editedSession}
          editedWeek={editedWeek}
          editedExercises={editedExercises}
          onSessionChange={onSessionChange}
          onWeekChange={onWeekChange}
          onUpdateExerciseName={updateExerciseName}
          onUpdateSetValue={updateSetValue}
          onSave={onSaveStrength}
        />
      )}

      {result.type === "cardio" && (
        <CardioConfirm
          editedDuration={editedDuration}
          editedDistance={editedDistance}
          editedHrAvg={editedHrAvg}
          editedHrMax={editedHrMax}
          onDurationChange={onDurationChange}
          onDistanceChange={onDistanceChange}
          onHrAvgChange={onHrAvgChange}
          onHrMaxChange={onHrMaxChange}
          onSave={onSaveCardio}
        />
      )}

      {result.type === "unknown" && (
        <div className="rounded-2xl border border-dashed border-(--color-line) bg-(--color-panel)/60 px-4 py-6 text-center space-y-2">
          <p className="font-display text-[14px] font-semibold text-(--color-ink)">
            Não foi possível identificar o tipo de treino
          </p>
          <p className="font-display text-[12px] text-(--color-ink-mute)">
            Tente com uma imagem mais clara ou de um app diferente.
          </p>
        </div>
      )}
    </div>
  );
}

function StrengthConfirm({
  editedSession,
  editedWeek,
  editedExercises,
  onSessionChange,
  onWeekChange,
  onUpdateExerciseName,
  onUpdateSetValue,
  onSave,
}: {
  editedSession: SessionKey;
  editedWeek: number;
  editedExercises: ImportedExercise[];
  onSessionChange: (s: SessionKey) => void;
  onWeekChange: (w: number) => void;
  onUpdateExerciseName: (idx: number, name: string) => void;
  onUpdateSetValue: (exIdx: number, setIdx: number, field: "load" | "reps", value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden divide-y divide-(--color-line)">
        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <Label className="shrink-0">Sessão</Label>
          <select
            value={editedSession}
            onChange={(e) => onSessionChange(e.target.value as SessionKey)}
            className="flex-1 rounded-xl bg-(--color-panel-2) border border-(--color-line) px-3 py-2 font-display text-[13px] text-(--color-ink) focus:outline-none"
          >
            {(Object.keys(SESSION_LABELS) as SessionKey[]).map((k) => (
              <option key={k} value={k}>
                {SESSION_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <Label className="shrink-0">Semana</Label>
          <Input
            type="number"
            min={1}
            max={53}
            value={editedWeek}
            onChange={(e) => onWeekChange(Number(e.target.value))}
            className="flex-1 max-w-[100px] text-right stat-num text-[16px]"
          />
        </div>
      </div>

      {editedExercises.length > 0 && (
        <div className="space-y-3">
          <p className="micro-label text-(--color-ink-mute) px-1">Exercícios</p>
          {editedExercises.map((ex, exIdx) => (
            <div
              key={exIdx}
              className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-(--color-line)">
                <Input
                  value={ex.name}
                  onChange={(e) => onUpdateExerciseName(exIdx, e.target.value)}
                  className="font-display text-[14px] font-semibold"
                />
              </div>

              <div className="px-4 py-3 space-y-2.5">
                <div className="grid gap-2" style={{ gridTemplateColumns: "2rem 1fr 1fr" }}>
                  <div />
                  <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
                    CARGA · KG
                  </div>
                  <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
                    REPS
                  </div>
                </div>
                {ex.sets.map((s, setIdx) => (
                  <div
                    key={setIdx}
                    className="grid gap-2 items-center"
                    style={{ gridTemplateColumns: "2rem 1fr 1fr" }}
                  >
                    <div className="grid place-items-center h-8 w-8 rounded-lg bg-(--color-panel-2) stat-num text-[13px] text-(--color-ink-mute)">
                      {setIdx + 1}
                    </div>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={s.load != null ? String(s.load) : ""}
                      onChange={(e) => onUpdateSetValue(exIdx, setIdx, "load", e.target.value)}
                      className="stat-num text-[16px] !py-2 !px-3"
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={s.reps != null ? String(s.reps) : ""}
                      onChange={(e) => onUpdateSetValue(exIdx, setIdx, "reps", e.target.value)}
                      className="stat-num text-[16px] !py-2 !px-3"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSave}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-(--color-lime) text-(--color-bg) py-4 font-display text-[15px] font-bold transition-opacity active:opacity-80"
      >
        <Check size={17} strokeWidth={3} />
        Salvar treino
      </button>
    </div>
  );
}

function CardioConfirm({
  editedDuration,
  editedDistance,
  editedHrAvg,
  editedHrMax,
  onDurationChange,
  onDistanceChange,
  onHrAvgChange,
  onHrMaxChange,
  onSave,
}: {
  editedDuration: string;
  editedDistance: string;
  editedHrAvg: string;
  editedHrMax: string;
  onDurationChange: (v: string) => void;
  onDistanceChange: (v: string) => void;
  onHrAvgChange: (v: string) => void;
  onHrMaxChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden divide-y divide-(--color-line)">
        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <Label className="shrink-0">Duração (min)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={editedDuration}
            onChange={(e) => onDurationChange(e.target.value)}
            className="flex-1 max-w-[100px] text-right stat-num text-[16px]"
          />
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <Label className="shrink-0">Distância (km)</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={editedDistance}
            onChange={(e) => onDistanceChange(e.target.value)}
            className="flex-1 max-w-[100px] text-right stat-num text-[16px]"
          />
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <Label className="shrink-0">FC média (bpm)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={editedHrAvg}
            onChange={(e) => onHrAvgChange(e.target.value)}
            className="flex-1 max-w-[100px] text-right stat-num text-[16px]"
          />
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <Label className="shrink-0">FC máx (bpm)</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={editedHrMax}
            onChange={(e) => onHrMaxChange(e.target.value)}
            className="flex-1 max-w-[100px] text-right stat-num text-[16px]"
          />
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-(--color-lime) text-(--color-bg) py-4 font-display text-[15px] font-bold transition-opacity active:opacity-80"
      >
        <Check size={17} strokeWidth={3} />
        Salvar
      </button>
    </div>
  );
}

function SavedState({
  onImportAnother,
  onGoToStrength,
}: {
  onImportAnother: () => void;
  onGoToStrength: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="grid place-items-center h-20 w-20 rounded-full bg-(--color-lime)/15 text-(--color-lime)">
        <Check size={36} strokeWidth={3} className="animate-[scale-in_0.3s_ease-out]" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-display text-[22px] font-bold text-(--color-ink)">Treino salvo!</p>
        <p className="font-display text-[13px] text-(--color-ink-mute)">
          Os dados foram adicionados ao seu histórico.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 w-full">
        <button
          onClick={onGoToStrength}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-(--color-flame) text-(--color-ink) py-4 font-display text-[15px] font-bold transition-opacity active:opacity-80"
        >
          Ver treino
        </button>
        <button
          onClick={onImportAnother}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-(--color-line) bg-(--color-panel) text-(--color-ink) py-4 font-display text-[14px] font-semibold transition-opacity active:opacity-80"
        >
          Importar outro
        </button>
      </div>
    </div>
  );
}
