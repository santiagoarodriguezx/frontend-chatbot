import { knowledgeRepository } from "../data/knowledge.repository";

export const knowledgeService = {
  list: (companyId: string) => knowledgeRepository.list(companyId),
  upload: (companyId: string, file: File) => knowledgeRepository.upload(companyId, file),
  delete: (companyId: string, fileName: string) =>
    knowledgeRepository.delete(companyId, fileName),
};
