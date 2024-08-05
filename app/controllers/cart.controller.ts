import { NextFunction, Request, Response } from "express";
import { db } from "../libs/db";
import { StatusCodes } from "http-status-codes";

class CartControllerClass {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req?.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          data: {
            message: "شناسه کاربر ارسال نشده است",
          },
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      let cart = await db.cart.findUnique({
        where: {
          userId,
        },
        select: {
          items: {
            select: {
              id: true,
              quantity: true,
              productId: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!cart) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "سبد خرید کاربر یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      return res.status(StatusCodes.OK).json({
        data: {
          cart,
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async add(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.productId;

    try {
      const userId = req?.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          data: {
            message: "شناسه کاربر ارسال نشده است",
          },
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      let cart = await db.cart.findUnique({
        where: {
          userId,
        },
      });

      if (!cart) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "سبد خرید کاربر یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      } else {
        const cartItem = await db.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId,
          },
        });

        if (cartItem) {
          await db.cartItem.update({
            where: {
              id: cartItem.id,
            },
            data: {
              quantity: cartItem.quantity + 1,
            },
          });
        } else {
          await db.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity: 1,
            },
          });
        }
      }

      return res.status(StatusCodes.OK).json({
        data: {
          message: "افزودن محصول موفقیت آمیز بود",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async decrease(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.productId;

    try {
      const userId = req?.user?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          data: {
            message: "شناسه کاربر ارسال نشده است",
          },
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      let cart = await db.cart.findUnique({
        where: {
          userId,
        },
      });

      if (!cart) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "سبد خرید یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      const cartItem = await db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (!cartItem) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "محصول با این شناسه در سبد خرید نیست",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      if (cartItem.quantity > 1) {
        await db.cartItem.update({
          where: {
            id: cartItem.id,
          },
          data: {
            quantity: cartItem.quantity - 1,
          },
        });
      } else {
        await db.cartItem.delete({
          where: {
            id: cartItem.id,
          },
        });
      }

      return res.status(StatusCodes.OK).json({
        data: {
          message: "کم کردن محصول از سبد خرید موفقیت آمیز بود",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    const cartItemId = req.params.cartItemId;

    try {
      const cartItem = await db.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
      });

      if (!cartItem) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "آیتم سبد خرید با این شناسه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      await db.cartItem.delete({
        where: {
          id: cartItem.id,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "حذف آیتم سبد خرید موفقیت آمیز بود",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const CartController = new CartControllerClass();

export default CartController;
