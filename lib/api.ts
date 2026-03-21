import { agentConfigService } from "@/features/agent-config/application/agent-config.service";
import { companiesService } from "@/features/companies/application/companies.service";
import { cannedResponsesService } from "@/features/canned-responses/application/canned-responses.service";
import { dashboardService } from "@/features/dashboard/application/dashboard.service";
import { knowledgeService } from "@/features/knowledge/application/knowledge.service";
import { modelsService } from "@/features/models/application/models.service";
import { toolsService } from "@/features/tools/application/tools.service";

export const companiesApi = {
  list: companiesService.list,
  bootstrap: companiesService.bootstrap,
  getMine: companiesService.getMine,
  get: companiesService.get,
  create: companiesService.create,
  update: companiesService.update,
  getQRCode: companiesService.getQRCode,
  getStatus: companiesService.getStatus,
};

export const agentApi = {
  get: agentConfigService.getConfig,
  update: agentConfigService.updateConfig,
};

export const modelsApi = {
  list: modelsService.list,
};

export const toolsApi = {
  listAvailable: toolsService.listAvailable,
  listCompany: toolsService.listCompany,
  upsert: toolsService.upsert,
};

export const cannedResponsesApi = {
  list: cannedResponsesService.list,
  create: cannedResponsesService.create,
  update: cannedResponsesService.update,
  delete: cannedResponsesService.delete,
};

export const dashboardApi = {
  metrics: dashboardService.metrics,
  conversations: dashboardService.conversations,
  messages: dashboardService.messages,
  orders: dashboardService.orders,
  appointments: dashboardService.appointments,
  products: dashboardService.products,
  createProduct: dashboardService.createProduct,
  updateProduct: dashboardService.updateProduct,
  deleteProduct: dashboardService.deleteProduct,
  updateOrderStatus: dashboardService.updateOrderStatus,
  updateAppointmentStatus: dashboardService.updateAppointmentStatus,
};

export const knowledgeApi = {
  list: knowledgeService.list,
  upload: knowledgeService.upload,
  delete: knowledgeService.delete,
};
