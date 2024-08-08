import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../../libs/validate-schema";
import { createAndUpdateAddressValidator } from "../../validations/user/address.validation";
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
      const userId = req.user?.id as string;

      const addressesCount = await db.address.count({
        where: {
          userId: userId,
        },
      });

      if (addressesCount === 5) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          data: {
            message: "شما امکان ساخت بیش از 5 آدرس را ندارید",
            error: "LIMIT_ADDRESS_COUNT",
          },
          status: StatusCodes.BAD_REQUEST,
        });
      }

      const {
        isReceiverMe,
        address,
        city,
        floor,
        houseNumber,
        receiverInformation,
        postalCode,
        province,
        unit,
      } = await validateSchema(createAndUpdateAddressValidator, req, res);

      await db.address.create({
        data: {
          userId,
          isReceiverMe,
          address,
          receiverInformation,
          city,
          floor,
          houseNumber,
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
      const userId = req.user?.id;

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
            error: "ACTIVE_ORDER",
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

  async update(req: Request, res: Response, next: NextFunction) {
    const addressId = req.params.addressId;

    try {
      const userId = req.user?.id;

      const existAddress = await db.address.findUnique({
        where: {
          id: addressId,
        },
      });

      if (!existAddress || existAddress.userId !== userId) {
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
            message:
              "شما با این آدرس سفارش فعال دارید، امکان بروزرسانی وجود ندارد",
            error: "ACTIVE_ORDER",
          },
          status: StatusCodes.BAD_REQUEST,
        });
      }

      const {
        isReceiverMe,
        address,
        city,
        floor,
        houseNumber,
        receiverInformation,
        postalCode,
        province,
        unit,
      } = await validateSchema(createAndUpdateAddressValidator, req, res);

      await db.address.update({
        where: {
          id: existAddress.id,
        },
        data: {
          isReceiverMe,
          address,
          city,
          floor,
          houseNumber,
          receiverInformation,
          postalCode,
          province,
          unit,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "آدرس با موفقیت بروزرسانی شد",
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
