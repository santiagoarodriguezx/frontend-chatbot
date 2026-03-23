import type { Company } from "@/lib/types";
import { companiesRepository } from "../data/companies.repository";

function normalizeCompanyPayload(data: Partial<Company>): Partial<Company> {
  const normalized: Partial<Company> = { ...data };
  const rawInstanceName = data.whatsapp_instance_name;

  if (rawInstanceName == null) {
    normalized.whatsapp_instance_name = null;
    return normalized;
  }

  const trimmed = rawInstanceName.trim();
  if (!trimmed) {
    normalized.whatsapp_instance_name = null;
    return normalized;
  }

  if (trimmed.length < 3) {
    throw new Error(
      "WhatsApp instancia debe tener al menos 3 caracteres o dejarse vacía.",
    );
  }

  normalized.whatsapp_instance_name = trimmed;
  return normalized;
}

export const companiesService = {
  list: () => companiesRepository.list(),
  bootstrap: () => companiesRepository.bootstrap(),
  getMine: () => companiesRepository.getMine(),
  get: (id: string) => companiesRepository.getById(id),
  create: (data: Partial<Company>) =>
    companiesRepository.create(normalizeCompanyPayload(data)),
  update: (id: string, data: Partial<Company>) =>
    companiesRepository.update(id, normalizeCompanyPayload(data)),
  getQRCode: (id: string) => companiesRepository.getQRCode(id),
  getStatus: (id: string) => companiesRepository.getStatus(id),
  createInstance: (id: string) => companiesRepository.createInstance(id),
};
