// services/TokenService
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { ITokenService } from "../interfaces/ITokenService";

interface DecodedToken extends JwtPayload {
  id: string; 
}

class TokenService implements ITokenService {
  private static instance: TokenService;

  private constructor() {}

  // Singleton Implementation
  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  generateToken(payload: string | object | Buffer, expiresIn: string | number = "2h"): string {
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, jwtSecret, options);
  }

  verifyToken(token: string): DecodedToken {
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    
    if (!decoded.id || !decoded.role) {
      throw new Error("Invalid token payload: Missing required fields");
    }
  
    return decoded;
  }
  }

export default TokenService.getInstance();
