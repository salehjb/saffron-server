import { NextFunction, Request, Response } from "express";
import { db } from "../../libs/db";
import { StatusCodes } from "http-status-codes";
import { validateSchema } from "../../libs/validate-schema";
import { editUserValidator } from "../../validations/admin/user.validation";

type UserQueryType = {
  limit: string;
  skip: string;
  search: string;
};

class UserAdminControllerClass {
  async get(
    req: Request<{}, {}, {}, UserQueryType>,
    res: Response,
    next: NextFunction
  ) {
    const limit = req.query.limit ? +req.query.limit : 10;
    const skip = req.query.skip ? +req.query.skip : 0;
    const search = req.query.search ? req.query.search : "";

    try {
      const numberOfUsers = await db.user.count({
        where: {
          role: "USER",
        },
      });

      const numberOfAdmins = await db.user.count({
        where: {
          role: "ADMIN",
        },
      });

      const totalUsers = await db.user.count();

      const users = await db.user.findMany({
        where: {
          OR: [
            { fullName: { contains: search } },
            { phoneNumber: { contains: search } },
          ],
        },
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          users,
          skip,
          limit,
          metadata: {
            totalUsers,
            numberOfUsers,
            numberOfAdmins,
          },
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async editUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    try {
      const { fullName, phoneNumber, role } = await validateSchema(
        editUserValidator,
        req,
        res
      );

      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "کاربری با این شناسه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      // check exist user with phone number
      if (phoneNumber) {
        const existUserWithPhoneNumber = await db.user.findUnique({
          where: {
            phoneNumber,
          },
        });

        if (
          existUserWithPhoneNumber &&
          existUserWithPhoneNumber.phoneNumber !== user.phoneNumber
        ) {
          return res.status(StatusCodes.CONFLICT).json({
            data: {
              message: "کاربر با شماره موبایل وارد شده موجود است",
            },
            status: StatusCodes.CONFLICT,
          });
        }
      }

      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          fullName,
          phoneNumber,
          role,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "بروزرسانی کاربر موفقیت آمیز بود",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const UserAdminController = new UserAdminControllerClass();

export default UserAdminController;
