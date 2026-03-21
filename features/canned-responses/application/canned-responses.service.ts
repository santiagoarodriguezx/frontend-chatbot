import {
  cannedResponsesRepository,
  type CannedResponseCreateInput,
  type CannedResponseUpdateInput,
} from "../data/canned-responses.repository";

function normalizeKeywords(items: string[] | undefined): string[] {
  if (!items) return [];
  return items.map((item) => item.trim()).filter(Boolean);
}

function validatePayload(data: CannedResponseCreateInput | CannedResponseUpdateInput) {
  if ("intent_key" in data && data.intent_key !== undefined) {
    const key = data.intent_key.trim();
    if (!key) throw new Error("Intent key es obligatorio");
    data.intent_key = key;
  }

  if ("intent_description" in data && data.intent_description !== undefined) {
    const description = data.intent_description.trim();
    if (!description) throw new Error("Intent description es obligatorio");
    data.intent_description = description;
  }

  if ("response_template" in data && data.response_template !== undefined) {
    const template = data.response_template.trim();
    if (!template) throw new Error("Response template es obligatorio");
    data.response_template = template;
  }

  if ("keywords" in data) {
    data.keywords = normalizeKeywords(data.keywords);
  }
}

export const cannedResponsesService = {
  list: (companyId: string) => cannedResponsesRepository.list(companyId),

  create: (companyId: string, data: CannedResponseCreateInput) => {
    const payload: CannedResponseCreateInput = {
      ...data,
      intent_key: data.intent_key.trim(),
      intent_description: data.intent_description.trim(),
      response_template: data.response_template.trim(),
      keywords: normalizeKeywords(data.keywords),
    };
    validatePayload(payload);
    return cannedResponsesRepository.create(companyId, payload);
  },

  update: (companyId: string, responseId: string, data: CannedResponseUpdateInput) => {
    const payload: CannedResponseUpdateInput = { ...data };
    validatePayload(payload);
    return cannedResponsesRepository.update(companyId, responseId, payload);
  },

  delete: (companyId: string, responseId: string) =>
    cannedResponsesRepository.delete(companyId, responseId),
};
