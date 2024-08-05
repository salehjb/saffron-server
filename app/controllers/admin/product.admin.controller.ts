import { NextFunction, Request, Response } from "express";
import { db } from "../../libs/db";
import { StatusCodes } from "http-status-codes";
import { validateSchema } from "../../libs/validate-schema";
import {
  changeIsActiveValidator,
  createProductValidator,
  updateProductValidator,
} from "../../validations/admin/product.validation";
import { deleteFileFromCloud, uploadFiles } from "../../libs/upload-service";
import { fileNameFromUrl } from "../../libs";

type ProductQueryType = {
  limit: string;
  skip: string;
  search: string;
};

class ProductAdminControllerClass {
  async get(
    req: Request<{}, {}, {}, ProductQueryType>,
    res: Response,
    next: NextFunction
  ) {
    const limit = req.query.limit ? +req.query.limit : 10;
    const skip = req.query.skip ? +req.query.skip : 0;
    const search = req.query.search ? req.query.search : "";

    try {
      const totalProducts = await db.product.count();

      const totalSoldProducts = await db.orderItem.aggregate({
        _sum: {
          quantity: true,
        },
      });

      const totalSalesData = await db.orderItem.findMany({
        include: {
          product: {
            select: {
              price: true,
            },
          },
        },
      });

      const totalSalesAmount = totalSalesData.reduce((acc, item) => {
        return acc + item.quantity * item.product.price;
      }, 0);

      const products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            {
              category: {
                name: { contains: search },
              },
            },
          ],
        },
        take: limit,
        skip,
        include: {
          category: true,
          orderItems: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const productsWithSalesInfo = products.map((product) => {
        const totalQuantitySold = product.orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        const totalSalesAmount = product.orderItems.reduce(
          (acc, item) => acc + item.quantity * product.price,
          0
        );

        return {
          ...product,
          totalQuantitySold,
          totalSalesAmount,
        };
      });

      return res.status(StatusCodes.OK).json({
        data: {
          products: productsWithSalesInfo,
          skip,
          limit,
          metadata: {
            totalProducts,
            totalSoldProducts: totalSoldProducts._sum.quantity || 0,
            totalSalesAmount: totalSalesAmount || 0,
          },
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, categoryId } = await validateSchema(
        createProductValidator,
        req,
        res
      );

      const existProductWithName = await db.product.findUnique({
        where: {
          name,
        },
      });

      if (existProductWithName) {
        return res.status(StatusCodes.CONFLICT).json({
          data: {
            message: "محصول با این نام از قبل موجود میباشد",
            error: "PRODUCT_NAME_EXIST",
          },
          status: StatusCodes.CONFLICT,
        });
      }

      // upload product image
      const files = req.files as Express.Multer.File[];
      let productImageUrl;
      if (files && files.length > 0) {
        const uploadedFileUrls = await uploadFiles(files, "products-image");
        if (uploadedFileUrls) {
          productImageUrl = uploadedFileUrls[0];
        }
      }

      if (!productImageUrl) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          data: {
            message: "مشکلی در آپلود تصویر محصول به وجود آمد",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      // create product
      await db.product.create({
        data: {
          name,
          description,
          price,
          categoryId,
          image: productImageUrl,
        },
      });

      return res.status(StatusCodes.CREATED).json({
        data: {
          message: "محصول با موفقیت ایجاد شد",
        },
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.id;

    try {
      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          orderItems: true,
        },
      });

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "محصولی با این شناسه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      const totalQuantitySold = product.orderItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      if (totalQuantitySold > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          data: {
            message: "محصول دارای خریدار قابل حدف نمیباشد",
          },
          status: StatusCodes.BAD_REQUEST,
        });
      }

      await deleteFileFromCloud(
        fileNameFromUrl(product.image),
        "products-image"
      );

      await db.product.delete({
        where: {
          id: product.id,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "محصول با موفقیت حذف شد",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.id;

    try {
      const { name, description, price, categoryId } = await validateSchema(
        updateProductValidator,
        req,
        res
      );

      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "محصولی با این شناسه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      if (name) {
        const existProductWithName = await db.product.findUnique({
          where: {
            name,
          },
        });

        if (
          existProductWithName &&
          existProductWithName.name !== product.name
        ) {
          return res.status(StatusCodes.CONFLICT).json({
            data: {
              message: "محصول با این نام از قبل موجود میباشد",
              error: "PRODUCT_NAME_EXIST",
            },
            status: StatusCodes.CONFLICT,
          });
        }
      }

      // update product image
      const files = req.files as Express.Multer.File[];
      let productImageUrl;
      if (files && files.length > 0) {
        const uploadedFileUrls = await uploadFiles(files, "products-image", [
          product.image,
        ]);
        if (uploadedFileUrls) {
          productImageUrl = uploadedFileUrls[0];
        }
      }

      await db.product.update({
        where: {
          id: product.id,
        },
        data: {
          name,
          description,
          price,
          image: productImageUrl,
          categoryId,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "بروزرسانی محصول با موفقیت انجام شد",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async changeIsActive(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.id;

    try {
      const { isActive } = await validateSchema(
        changeIsActiveValidator,
        req,
        res
      );

      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "محصول با این شناسه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      await db.product.update({
        where: {
          id: product.id,
        },
        data: {
          isActive,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "تغییر وضعیت فعالیت محصول موفقیت آمیز بود",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const ProductAdminController = new ProductAdminControllerClass();

export default ProductAdminController;
