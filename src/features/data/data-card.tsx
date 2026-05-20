import { useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { AppData } from "@/lib/storage/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Status = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "err"; text: string };

export function DataCard() {
  const { data, replaceData, resetData } = useStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pfit-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ kind: "ok", text: "exportado" });
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const next = validateAppData(parsed);
      if (!next) {
        setStatus({ kind: "err", text: "JSON inválido (esperava version=1)." });
        return;
      }
      const ok = window.confirm(
        `Importar substituirá os dados atuais por:\n· ${next.exerciseLogs.length} logs\n· ${next.weeklyLogs.length} semanas\n\nContinuar?`,
      );
      if (!ok) {
        setStatus({ kind: "idle" });
        return;
      }
      replaceData(next);
      setStatus({ kind: "ok", text: "importado" });
    } catch (e) {
      setStatus({ kind: "err", text: e instanceof Error ? e.message : "falha ao ler" });
    }
  };

  const handleReset = () => {
    if (!window.confirm("Apagar todos os dados locais? Não há como desfazer.")) return;
    resetData();
    setStatus({ kind: "ok", text: "apagado" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados</CardTitle>
        <CardDescription>Backup, restauração e reset.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} /> Export
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Import
          </Button>
          <Button variant="danger" size="sm" onClick={handleReset}>
            <Trash2 size={14} /> Reset
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
        </div>

        {status.kind !== "idle" && (
          <p
            className={
              "micro-label " + (status.kind === "ok" ? "text-(--color-lime)" : "text-(--color-rose)")
            }
          >
            → {status.text}
          </p>
        )}

        <p className="font-display text-[11.5px] text-(--color-ink-mute)">
          {data.exerciseLogs.length} logs · {data.weeklyLogs.length} semanas registradas
        </p>
      </CardContent>
    </Card>
  );
}

function validateAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) return null;
  if (!r.settings || typeof r.settings !== "object") return null;
  if (!Array.isArray(r.exerciseLogs)) return null;
  if (!Array.isArray(r.weeklyLogs)) return null;
  return raw as AppData;
}
