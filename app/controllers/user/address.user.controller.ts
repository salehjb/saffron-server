import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../../libs/validate-schema";
import { createAddressValidator } from "../../validations/user/address.validation";
import { db } from "../../libs/db";
import { StatusCodes } from "http-status-codes";

class UserAddressControllerClass {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req?.user?.id;

      const addresses = await db.address.findMany({
        where: {
          userId: userId,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          addresses,
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req?.user?.id as string;

      const addressesCount = await db.address.count({
        where: {
          userId: userId,
        },
      });

      if (addressesCount === 5) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          data: {
            message: "شما امکان ساخت بیش از 5 آدرس را ندارید",
          },
          status: StatusCodes.BAD_REQUEST,
        });
      }

      const {
        address,
        city,
        floor,
        houseNumber,
        phoneNumber,
        postalCode,
        province,
        unit,
      } = await validateSchema(createAddressValidator, req, res);

      await db.address.create({
        data: {
          userId,
          address,
          city,
          floor,
          houseNumber,
          phoneNumber,
          postalCode,
          province,
          unit,
        },
      });

      return res.status(StatusCodes.CREATED).json({
        data: {
          message: "آدرس با موفقیت ایجاد شد",
        },
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const addressId = req.params.addressId;

    try {
      const userId = req?.user?.id;

      const address = await db.address.findUnique({
        where: { id: addressId },
      });

      if (!address || address.userId !== userId) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "آدرس یافت نشد یا شما دسترسی به حذف آدرس ندارید",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      const hasActiveOrder = await db.order.findFirst({
        where: {
          addressId,
          status: {
            notIn: ["DELIVERED", "CANCELED"],
          },
        },
      });

      if (hasActiveOrder) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          data: {
            message: "شما با این آدرس سفارش فعال دارید، امکان حذف وجود ندارد",
          },
          status: StatusCodes.BAD_REQUEST,
        });
      }

      await db.address.delete({
        where: {
          id: addressId,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "آدرس با موفقیت حذف شد",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const UserAddressController = new UserAddressControllerClass();

export default UserAddressController;
