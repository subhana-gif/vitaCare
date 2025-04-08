import { Request, Response, NextFunction } from "express";
import TokenService from "../services/tokenService";
import User from "../models/user";
import { IUserDocument } from "../interfaces/user/IUser";
import { HttpStatus,HttpMessage } from "../enums/HttpStatus";

interface DecodedToken {
  id: string;
  role: "admin" | "doctor" | "user";
  name?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedToken;
  }
}

export const verifyToken = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
    const authHeader = req.headers.authorization;

    // ✅ Ensure token is in "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(HttpStatus.UNAUTHORIZED).json({ message: "Access Denied. No token provided." });
     return;  
    }

    const token = authHeader.split(" ")[1]; 
    if (!token) {
     res.status(HttpStatus.UNAUTHORIZED).json({ message: "Access Denied. Invalid token format." });
     return;
    }
    try {
      const decoded = TokenService.verifyToken(token) as DecodedToken;
      if (!decoded.role || !roles.includes(decoded.role)) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Forbidden: Insufficient permissions." });
        return;
      }

      const user = (User.findById(decoded.id)) as unknown as IUserDocument | null;
      ;
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
        return;
      }

      if (user.isBlocked) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Your account is blocked. Please contact support." });
        return;
      }

    
      req.user = decoded;
      next(); 
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
    }
      };
};
