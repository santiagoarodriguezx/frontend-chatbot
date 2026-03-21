import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import type { CannedResponse } from "@/lib/types";
import { cannedResponsesService } from "../application/canned-responses.service";

type FormState = {
  intent_key: string;
  intent_description: string;
  response_template: string;
  keywords_text: string;
  is_enabled: boolean;
  priority: number;
};

const initialFormState: FormState = {
  intent_key: "",
  intent_description: "",
  response_template: "",
  keywords_text: "",
  is_enabled: true,
  priority: 0,
};

function toKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useCannedResponses(companyId: string) {
  const key = `canned-responses-${companyId}`;
  const { data, isLoading, error } = useSWR<CannedResponse[]>(key, () =>
    cannedResponsesService.list(companyId),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const responses = useMemo(() => data ?? [], [data]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialFormState);
    setFormError(null);
  }

  function openCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  function startEdit(item: CannedResponse) {
    setEditingId(item.id);
    setIsModalOpen(true);
    setFormError(null);
    setForm({
      intent_key: item.intent_key,
      intent_description: item.intent_description,
      response_template: item.response_template,
      keywords_text: item.keywords.join(", "),
      is_enabled: item.is_enabled,
      priority: item.priority,
    });
  }

  async function submit() {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        intent_key: form.intent_key,
        intent_description: form.intent_description,
        response_template: form.response_template,
        keywords: toKeywords(form.keywords_text),
        is_enabled: form.is_enabled,
        priority: Number.isFinite(form.priority) ? form.priority : 0,
      };

      if (editingId) {
        await cannedResponsesService.update(companyId, editingId, payload);
      } else {
        await cannedResponsesService.create(companyId, payload);
      }

      await mutate(key);
      closeModal();
    } catch (value) {
      setFormError(
        value instanceof Error ? value.message : "No se pudo guardar",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(responseId: string) {
    await cannedResponsesService.delete(companyId, responseId);
    await mutate(key);
    if (editingId === responseId) {
      closeModal();
    }
  }

  return {
    closeModal,
    editingId,
    error,
    form,
    formError,
    isLoading,
    isModalOpen,
    openCreate,
    remove,
    resetForm,
    responses,
    setField,
    startEdit,
    submit,
    submitting,
  };
}
