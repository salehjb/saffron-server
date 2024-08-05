import { NextFunction, Request, Response } from "express";
import { db } from "../../libs/db";
import { OrderStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

type OrderQueryType = {
  limit: string;
  skip: string;
  search: string;
};

async function getOrdersCountByStatus(status: OrderStatus): Promise<number> {
  const count = await db.order.count({
    where: {
      status,
    },
  });
  return count;
}

class OrderAdminControllerClass {
  async get(
    req: Request<{}, {}, {}, OrderQueryType>,
    res: Response,
    next: NextFunction
  ) {
    const limit = req.query.limit ? +req.query.limit : 10;
    const skip = req.query.skip ? +req.query.skip : 0;
    const search = req.query.search ? req.query.search : "";

    try {
      const totalOrders = await db.order.count();
      const totalPendingOrders = await getOrdersCountByStatus("PENDING");
      const totalProcessingOrders = await getOrdersCountByStatus("PROCESSING");
      const totalShippedOrders = await getOrdersCountByStatus("SHIPPED");
      const totalDeliveredOrders = await getOrdersCountByStatus("DELIVERED");
      const totalCanceledOrders = await getOrdersCountByStatus("CANCELED");

      const orders = await db.order.findMany({
        where: {
          OR: [{ user: { fullName: { contains: search } } }],
        },
        take: limit,
        skip,
        include: {
          user: {
            select: {
              fullName: true,
              phoneNumber: true,
            },
          },
          address: true,
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          orders,
          skip,
          limit,
          metadata: {
            totalOrders,
            totalPendingOrders,
            totalProcessingOrders,
            totalShippedOrders,
            totalDeliveredOrders,
            totalCanceledOrders,
          },
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const OrderAdminController = new OrderAdminControllerClass();

export default OrderAdminController;
