export interface ITokenService {
    generateToken(payload: Record<string, unknown>): string;
  }
  