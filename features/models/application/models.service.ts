import { modelsRepository } from "../data/models.repository";

export const modelsService = {
  list: (provider?: string) => modelsRepository.list(provider),
};
