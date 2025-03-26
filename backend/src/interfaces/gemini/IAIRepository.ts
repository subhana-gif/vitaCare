// src/interfaces/IAIRepository.ts
export interface IAIRepository {
    getResponse(message: string): Promise<string>;
  }