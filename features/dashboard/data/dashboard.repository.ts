import { apiFetch } from "@/lib/utils";
import type {
  Appointment,
  CompanyMetricsDaily,
  CompanyMetricsGeneral,
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
  metricsGeneral(companyId: string) {
    return apiFetch<CompanyMetricsGeneral>(
      `/companies/${companyId}/metrics/general`,
    );
  },
  metricsDaily(companyId: string, days = 7) {
    return apiFetch<CompanyMetricsDaily[]>(
      `/companies/${companyId}/metrics/daily?days=${days}`,
    );
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
  updateOrderStatus(companyId: string, orderId: string, status: string) {
    return apiFetch<void>(
      `/dashboard/${companyId}/orders/${orderId}/status?status=${status}`,
      {
        method: "PATCH",
      },
    );
  },
  updateAppointmentStatus(
    companyId: string,
    appointmentId: string,
    status: string,
  ) {
    return apiFetch<void>(
      `/dashboard/${companyId}/appointments/${appointmentId}/status?status=${status}`,
      {
        method: "PATCH",
      },
    );
  },
};
