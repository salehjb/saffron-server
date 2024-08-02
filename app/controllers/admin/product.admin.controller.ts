import { NextFunction, Request, Response } from "express";
import { db } from "../../libs/db";
import { StatusCodes } from "http-status-codes";
import { validateSchema } from "../../libs/validate-schema";
import { createProductValidator } from "../../validations/admin/product.validation";
import { uploadFiles } from "../../libs/upload-service";

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
      const products = await db.product.findMany({
        where: {
          name: { contains: search },
        },
        take: limit,
        skip,
      });

      return res.status(StatusCodes.OK).json({
        data: {
          products,
          skip,
          limit,
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
    try {
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

const ProductAdminController = new ProductAdminControllerClass();

export default ProductAdminController;
