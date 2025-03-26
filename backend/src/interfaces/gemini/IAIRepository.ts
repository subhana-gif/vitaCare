export interface IAIRepository {
    getResponse(message: string): Promise<string>;
  }