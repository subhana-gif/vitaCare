// controllers/AuthController.ts
import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AdminService";
import { IAuthService } from "interfaces/IAuthService";

export class AuthController {
  constructor(private authService: IAuthService) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const token = await this.authService.login(email, password);
      res.json({ token });
    } catch (error) {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  };
}

export default new AuthController(AuthService);
