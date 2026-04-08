"use client";
import useSWR, { mutate } from "swr";
import { useRef, useState } from "react";
import { knowledgeApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { KnowledgeDoc } from "@/lib/types";
import { Upload, Trash2, FileText, BookOpen } from "lucide-react";

export default function KnowledgePage() {
  const companyId = useCompany();
  const key = `knowledge-${companyId}`;
  const { data: docs, isLoading } = useSWR<KnowledgeDoc[]>(key, () =>
    knowledgeApi.list(companyId),
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const files = Array.from(new Set((docs ?? []).map((d) => d.file_name)));
  const docsByFile: Record<string, KnowledgeDoc[]> = {};
  for (const d of docs ?? []) {
    docsByFile[d.file_name] = docsByFile[d.file_name] ?? [];
    docsByFile[d.file_name].push(d);
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await knowledgeApi.upload(companyId, file);
      await mutate(key);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deleteFile(fileName: string) {
    if (!confirm(`Delete all chunks of "${fileName}"?`)) return;
    await knowledgeApi.delete(companyId, fileName);
    await mutate(key);
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Conocimiento del Agente
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Sube documentos para que tu agente los use como referencia al asistir
          a los clientes.
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-6 animate-fade-in-up">
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">
          Sube Documentos de Referencia
        </h2>
        <p className="text-xs text-neutral-400 mb-4">
          Soportado: PDF, DOCX, TXT, MD — auto-chunked y embebidos para RAG
        </p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-2xl p-10 cursor-pointer hover:border-neutral-950 hover:bg-neutral-50/50 transition-all duration-300 group">
          <div className="p-3 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 transition-colors duration-300 mb-3">
            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="text-sm text-neutral-500">
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-950 rounded-full animate-spin" />
                Subiendo y procesando...
              </span>
            ) : (
              "Click para seleccionar un archivo o arrástralo aquí"
            )}
          </span>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
            onChange={upload}
            disabled={uploading}
          />
        </label>
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">
            {error}
          </p>
        )}
      </div>

      {/* File list */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 divide-y divide-neutral-100 animate-fade-in-up delay-200">
        {isLoading && (
          <div className="px-5 py-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-3 py-3">
                <div className="w-5 h-5 skeleton rounded" />
                <div className="w-40 h-4 skeleton" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && files.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-neutral-500 text-sm">No documents indexed yet</p>
            <p className="text-neutral-400 text-xs mt-1">
              Upload a document to get started with RAG
            </p>
          </div>
        )}
        {files.map((fileName) => {
          const chunks = docsByFile[fileName];
          return (
            <div
              key={fileName}
              className="px-5 py-4 flex items-center gap-3 group hover:bg-neutral-50/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-neutral-100 group-hover:bg-neutral-950 transition-colors duration-200">
                <FileText className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-950 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-neutral-400">
                  {chunks.length} chunk{chunks.length !== 1 ? "s" : ""} ·{" "}
                  {chunks[0].file_type}
                </p>
              </div>
              <button
                onClick={() => deleteFile(fileName)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-600" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
