import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../libs/db";

class ProfileControllerClass {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req?.user?.id;

      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

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
