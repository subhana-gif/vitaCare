import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";

class UserController {
  constructor(private userService: typeof UserService) {}
  
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await UserService.register({ email, password, name });
      res.status(200).json({ success: true, message: "User registered successfully", data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
          } else {
            res.status(500).json({ error: "An unexpected error occurred" });
          }
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await UserService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await UserService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await UserService.sendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await UserService.verifyOTP(email, otp);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await UserService.resendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async toggleBlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await UserService.toggleBlockUser(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as { user?: { id: string } }).user?.id;
         if (!userId) {
        throw new Error("User ID is missing");
      }
      const user = await UserService.getUserProfile(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as { user?: { id: string } }).user?.id;
      if (!userId) {
        throw new Error("User ID is missing");
      }
      const updatedData = req.body;
      const user = await UserService.updateUserProfile(userId, updatedData);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController(UserService);