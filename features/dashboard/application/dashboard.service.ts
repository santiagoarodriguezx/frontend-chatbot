import type { Product } from "@/lib/types";
import { dashboardRepository } from "../data/dashboard.repository";

export const dashboardService = {
  metrics: (companyId: string) => dashboardRepository.metrics(companyId),
  conversations: (companyId: string) => dashboardRepository.conversations(companyId),
  messages: (companyId: string, conversationId: string) =>
    dashboardRepository.messages(companyId, conversationId),
  orders: (companyId: string, status?: string) =>
    dashboardRepository.orders(companyId, status),
  appointments: (companyId: string) => dashboardRepository.appointments(companyId),
  products: (companyId: string) => dashboardRepository.products(companyId),
  createProduct: (companyId: string, data: Partial<Product>) =>
    dashboardRepository.createProduct(companyId, data),
  updateProduct: (companyId: string, productId: string, data: Partial<Product>) =>
    dashboardRepository.updateProduct(companyId, productId, data),
  deleteProduct: (companyId: string, productId: string) =>
    dashboardRepository.deleteProduct(companyId, productId),
};
