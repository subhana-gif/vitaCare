  import { IAuthService } from "../interfaces/IAuthService";
  import { ITokenService } from "../interfaces/ITokenService";
  import TokenService from "./tokenService";

  class AuthService implements IAuthService {
    constructor(private tokenService: ITokenService) {}

    async login(email: string, password: string): Promise<string> {
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

      if (email.trim() !== ADMIN_EMAIL.trim() || password.trim() !== ADMIN_PASSWORD.trim()) {
        throw new Error("Invalid credentials");
      }

      return this.tokenService.generateToken({ email: ADMIN_EMAIL, role: "admin", id: "admin123" });
    }
  }

  export default new AuthService(TokenService);
