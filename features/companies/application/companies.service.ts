import type { Company } from "@/lib/types";
import { companiesRepository } from "../data/companies.repository";

export const companiesService = {
  list: () => companiesRepository.list(),
  bootstrap: () => companiesRepository.bootstrap(),
  getMine: () => companiesRepository.getMine(),
  get: (id: string) => companiesRepository.getById(id),
  create: (data: Partial<Company>) => companiesRepository.create(data),
  update: (id: string, data: Partial<Company>) => companiesRepository.update(id, data),
  getQRCode: (id: string) => companiesRepository.getQRCode(id),
  getStatus: (id: string) => companiesRepository.getStatus(id),
};
