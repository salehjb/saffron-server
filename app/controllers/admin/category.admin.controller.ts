import { NextFunction, Request, Response } from "express";
import { db } from "../../libs/db";
import { StatusCodes } from "http-status-codes";
import { validateSchema } from "../../libs/validate-schema";
import { createAndUpdateCategoryValidator } from "../../validations/admin/category.validation";
import { OBJECTID_REGEX } from "../../regexes";

type CategoryQueryType = {
  limit: string;
  skip: string;
  search: string;
};

class AdminCategoryControllerClass {
  async get(
    req: Request<{}, {}, {}, CategoryQueryType>,
    res: Response,
    next: NextFunction
  ) {
    const limit =
      req.query.limit === "unlimited"
        ? undefined
        : req.query.limit
        ? +req.query.limit
        : 10;
    const skip = req.query.skip ? +req.query.skip : 0;
    const search = req.query.search ? req.query.search : "";

    try {
      const totalCategories = await db.category.count();

      const categories = await db.category.findMany({
        where: {
          name: { contains: search },
        },
        include: {
          _count: { select: { products: true } },
        },
        take: limit,
        skip,
      });

      return res.status(StatusCodes.OK).json({
        data: {
          categories,
          skip,
          limit,
          metadata: {
            totalCategories,
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
      const { name } = await validateSchema(
        createAndUpdateCategoryValidator,
        req,
        res
      );

      const category = await db.category.findUnique({
        where: {
          name,
        },
      });

      if (category) {
        return res.status(StatusCodes.CONFLICT).json({
          data: {
            message: "دسته بندی با این نام موجود میباشد",
          },
          status: StatusCodes.CONFLICT,
        });
      }

      await db.category.create({
        data: {
          name,
        },
      });

      return res.status(StatusCodes.CREATED).json({
        data: {
          message: "دسته بندی با موفقیت ساخته شد",
        },
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const categoryId = req.params.id;

    try {
      const newCategoryId = req.headers.newCategoryId;

      if (newCategoryId && typeof newCategoryId === "string") {
        if (!OBJECTID_REGEX.test(newCategoryId)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            data: {
              message: "شناسه دسته بندی جدید اشتباه است",
            },
            status: StatusCodes.BAD_REQUEST,
          });
        }
      }

      const category = await db.category.findUnique({
        where: {
          id: categoryId,
        },
        include: {
          products: true,
        },
      });

      if (!category) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "دسته بندی با این شناسه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      if (newCategoryId && typeof newCategoryId === "string") {
        const newCategory = await db.category.findUnique({
          where: {
            id: newCategoryId,
          },
          select: {
            id: true,
          },
        });

        if (!newCategory) {
          return res.status(StatusCodes.NOT_FOUND).json({
            data: {
              message: "دسته بندی جدید با این شناسه یافت نشد",
            },
            status: StatusCodes.NOT_FOUND,
          });
        }

        await db.product.updateMany({
          where: {
            categoryId: category.id,
          },
          data: {
            categoryId: newCategory.id,
          },
        });
      }

      await db.category.delete({
        where: {
          id: category.id,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "دسته بندی با موفقیت حذف شد",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const categoryId = req.params.id;

    try {
      const { name } = await validateSchema(
        createAndUpdateCategoryValidator,
        req,
        res
      );

      const category = await db.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "دسته بندی با این شناسه یافت نشد",
          },
          status: StatusCodes.CONFLICT,
        });
      }

      const existCategoryWithName = await db.category.findFirst({
        where: {
          name,
        },
      });

      if (
        existCategoryWithName &&
        existCategoryWithName.name !== category.name
      ) {
        return res.status(StatusCodes.CONFLICT).json({
          data: {
            message: "دسته بندی با این نام از قبل موجود است",
          },
          status: StatusCodes.CONFLICT,
        });
      }

      await db.category.update({
        where: {
          id: category.id,
        },
        data: {
          name,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "دسته بندی با موفقیت بروزرسانی شد",
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const AdminCategoryController = new AdminCategoryControllerClass();

export default AdminCategoryController;
