import { apiFetch } from "@/lib/utils";
import type {
  Appointment,
  Conversation,
  DashboardMetrics,
  Message,
  Order,
  Product,
} from "@/lib/types";

export const dashboardRepository = {
  metrics(companyId: string) {
    return apiFetch<DashboardMetrics>(`/dashboard/${companyId}/metrics`);
  },
  conversations(companyId: string) {
    return apiFetch<Conversation[]>(`/dashboard/${companyId}/conversations`);
  },
  messages(companyId: string, conversationId: string) {
    return apiFetch<Message[]>(
      `/dashboard/${companyId}/conversations/${conversationId}/messages`,
    );
  },
  orders(companyId: string, status?: string) {
    return apiFetch<Order[]>(
      `/dashboard/${companyId}/orders${status ? `?status=${status}` : ""}`,
    );
  },
  appointments(companyId: string) {
    return apiFetch<Appointment[]>(`/dashboard/${companyId}/appointments`);
  },
  products(companyId: string) {
    return apiFetch<Product[]>(`/dashboard/${companyId}/products`);
  },
  createProduct(companyId: string, data: Partial<Product>) {
    return apiFetch<Product>(`/dashboard/${companyId}/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateProduct(companyId: string, productId: string, data: Partial<Product>) {
    return apiFetch<Product>(`/dashboard/${companyId}/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  deleteProduct(companyId: string, productId: string) {
    return apiFetch<void>(`/dashboard/${companyId}/products/${productId}`, {
      method: "DELETE",
    });
  },
};
