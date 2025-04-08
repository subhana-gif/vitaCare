import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload & { id: string };
    io?: SocketIOServer;
    user?: {
      id: string;
      name: string;
      email?: string;
      role?: string;
    };
  }
}

export type ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;
