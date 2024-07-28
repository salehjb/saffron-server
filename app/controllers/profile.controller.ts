import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class ProfileControllerClass {
  getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      return res.status(StatusCodes.OK).json({
        data: {
          user,
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const ProfileController = new ProfileControllerClass();

export default ProfileController;
