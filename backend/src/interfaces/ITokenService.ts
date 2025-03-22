// interfaces/ITokenService.ts
export interface ITokenService {
    generateToken(payload: Record<string, unknown>): string;
  }
  