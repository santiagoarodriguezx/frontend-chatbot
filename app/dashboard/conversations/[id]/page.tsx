"use client";
import useSWR from "swr";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Wrench, Bot, User } from "lucide-react";

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.role === "user";
  const isTool = msg.role === "tool";

  if (isTool) {
    return (
      <div
        className="flex justify-center animate-fade-in"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-center gap-1.5 bg-neutral-100 text-neutral-500 text-xs px-3 py-1.5 rounded-full border border-neutral-200/60">
          <Wrench className="w-3 h-3" />
          <span>
            {msg.tool_name}: {(msg.content ?? "").slice(0, 80)}…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2 animate-fade-in",
        isUser ? "justify-end" : "justify-start",
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-neutral-950 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[70%] px-4 py-2.5 text-sm",
          isUser
            ? "bg-neutral-950 text-white rounded-2xl rounded-br-sm"
            : "bg-white border border-neutral-200/60 text-neutral-900 rounded-2xl rounded-bl-sm",
        )}
      >
        {msg.content}
        <p
          className={cn(
            "text-[10px] mt-1.5",
            isUser ? "text-neutral-400" : "text-neutral-400",
          )}
        >
          {new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-neutral-600" />
        </div>
      )}
    </div>
  );
}

export default function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const companyId = useCompany();
  const { data: messages, isLoading } = useSWR<Message[]>(
    `messages-${params.id}`,
    () => dashboardApi.messages(companyId, params.id),
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 1000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    },
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/conversations"
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-950">
            Historial de chat
          </h1>
          <p className="text-xs text-neutral-400">
            Refresca para cargar nuevos mensajes. Las conversaciones se ordenan
            por el último mensaje recibido.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-neutral-50/50 rounded-2xl border border-neutral-200/60 p-5 space-y-3">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-950 rounded-full animate-spin" />
            <p className="text-neutral-400 text-sm mt-3">
              Cargando mensajes...
            </p>
          </div>
        )}
        {(messages ?? []).map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} index={i} />
        ))}
        {!isLoading && (messages ?? []).length === 0 && (
          <p className="text-neutral-400 text-sm text-center py-10">
            Ningun mensaje en esta conversación aun.
          </p>
        )}
      </div>
    </div>
  );
}
