import { toolsRepository, type CompanyToolUpsertInput } from "../data/tools.repository";

export const toolsService = {
  listAvailable: (category?: string) => toolsRepository.listAvailable(category),
  listCompany: (companyId: string) => toolsRepository.listCompany(companyId),
  upsert: (companyId: string, toolId: string, data: CompanyToolUpsertInput) =>
    toolsRepository.upsert(companyId, toolId, data),
};
