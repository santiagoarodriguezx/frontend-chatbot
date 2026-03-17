// Centralised API client (uses NEXT_PUBLIC_API_URL)
import { apiFetch } from "./utils";
import type {
  AgentConfig,
  Appointment,
  AvailableTool,
  Company,
  CompanyTool,
  Conversation,
  DashboardMetrics,
  KnowledgeDoc,
  LLMModel,
  Message,
  Order,
  Product,
  CompanyBootstrap,
} from "./types";

// ── Companies ───────────────────────────────────────────────────
export const companiesApi = {
  list: () => apiFetch<Company[]>("/companies/"),
  bootstrap: () => apiFetch<CompanyBootstrap>("/companies/bootstrap"),
  getMine: () => apiFetch<Company>("/companies/me"),
  get: (id: string) => apiFetch<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) =>
    apiFetch<Company>("/companies/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Company>) =>
    apiFetch<Company>(`/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getQRCode: (id: string) =>
    apiFetch<{ qrcode: string }>(`/companies/${id}/instance/qrcode`),
  getStatus: (id: string) =>
    apiFetch<{ state: string }>(`/companies/${id}/instance/status`),
};

// ── Agent Config ────────────────────────────────────────────────
export const agentApi = {
  get: (companyId: string) =>
    apiFetch<AgentConfig>(`/agent-config/${companyId}`),
  update: (companyId: string, data: Partial<AgentConfig>) =>
    apiFetch<AgentConfig>(`/agent-config/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ── LLM Models ──────────────────────────────────────────────────
export const modelsApi = {
  list: (provider?: string) =>
    apiFetch<LLMModel[]>(`/models/${provider ? `?provider=${provider}` : ""}`),
};

// ── Tools ───────────────────────────────────────────────────────
export const toolsApi = {
  listAvailable: (category?: string) =>
    apiFetch<AvailableTool[]>(
      `/tools/available${category ? `?category=${category}` : ""}`,
    ),
  listCompany: (companyId: string) =>
    apiFetch<CompanyTool[]>(`/tools/${companyId}`),
  upsert: (
    companyId: string,
    toolId: string,
    data: { is_enabled: boolean; custom_config: Record<string, unknown> },
  ) =>
    apiFetch<CompanyTool>(`/tools/${companyId}/${toolId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ── Dashboard ───────────────────────────────────────────────────
export const dashboardApi = {
  metrics: (companyId: string) =>
    apiFetch<DashboardMetrics>(`/dashboard/${companyId}/metrics`),
  conversations: (companyId: string) =>
    apiFetch<Conversation[]>(`/dashboard/${companyId}/conversations`),
  messages: (companyId: string, conversationId: string) =>
    apiFetch<Message[]>(
      `/dashboard/${companyId}/conversations/${conversationId}/messages`,
    ),
  orders: (companyId: string, status?: string) =>
    apiFetch<Order[]>(
      `/dashboard/${companyId}/orders${status ? `?status=${status}` : ""}`,
    ),
  appointments: (companyId: string) =>
    apiFetch<Appointment[]>(`/dashboard/${companyId}/appointments`),
  products: (companyId: string) =>
    apiFetch<Product[]>(`/dashboard/${companyId}/products`),
  createProduct: (companyId: string, data: Partial<Product>) =>
    apiFetch<Product>(`/dashboard/${companyId}/products`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (
    companyId: string,
    productId: string,
    data: Partial<Product>,
  ) =>
    apiFetch<Product>(`/dashboard/${companyId}/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProduct: (companyId: string, productId: string) =>
    apiFetch<void>(`/dashboard/${companyId}/products/${productId}`, {
      method: "DELETE",
    }),
};

// ── Knowledge ───────────────────────────────────────────────────
export const knowledgeApi = {
  list: (companyId: string) =>
    apiFetch<KnowledgeDoc[]>(`/knowledge/${companyId}`),
  upload: async (companyId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<{ message: string }>(`/knowledge/${companyId}/upload`, {
      method: "POST",
      body: form,
    });
  },
  delete: (companyId: string, fileName: string) =>
    apiFetch<void>(`/knowledge/${companyId}/${encodeURIComponent(fileName)}`, {
      method: "DELETE",
    }),
};
