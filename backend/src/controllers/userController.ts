import { Request, Response, NextFunction } from "express";
import { userServiceInstance } from "../services/userService";
import { IUserService } from "../interfaces/IUserservice";

class UserController {
  constructor(private userService: IUserService) {}  
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await this.userService.register({ email, password, name });
      res.status(200).json({ success: true, message: "User registered successfully", data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.userService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await this.userService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.userService.sendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await this.userService.verifyOTP(email, otp);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.userService.resendOTP(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async toggleBlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await this.userService.toggleBlockUser(userId);
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
      const user = await this.userService.getUserProfile(userId);
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
      const user = await this.userService.updateUserProfile(userId, updatedData);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController(userServiceInstance);  