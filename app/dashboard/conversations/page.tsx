"use client";
import useSWR from "swr";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { Conversation } from "@/lib/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronRight } from "lucide-react";

export default function ConversationsPage() {
  const companyId = useCompany();
  const { data: conversations, isLoading } = useSWR<Conversation[]>(
    `conversations-${companyId}`,
    () => dashboardApi.conversations(companyId),
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Conversations
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor customer interactions with your agent
        </p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 divide-y divide-neutral-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full skeleton" />
              <div className="flex-1">
                <div className="w-32 h-4 skeleton mb-2" />
                <div className="w-20 h-3 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 divide-y divide-neutral-100 animate-fade-in-up">
          {(conversations ?? []).map((conv, i) => (
            <Link
              key={conv.id}
              href={`/dashboard/conversations/${conv.id}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors duration-200"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-950 transition-colors duration-300">
                <MessageSquare className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-950 text-sm">
                  {conv.customer_name ?? conv.customer_phone}
                </p>
                <p className="text-xs text-neutral-400">
                  {conv.customer_phone}
                </p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  {conv.last_message_at && (
                    <p className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(conv.last_message_at), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                  {conv.is_active && (
                    <span className="inline-block mt-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </div>
            </Link>
          ))}

          {(conversations ?? []).length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="text-neutral-500 text-sm">No conversations yet</p>
              <p className="text-neutral-400 text-xs mt-1">
                Conversations will appear here when customers message your agent
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
