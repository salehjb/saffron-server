import { NextFunction, Request, Response } from "express";
import { db } from "../libs/db";
import { StatusCodes } from "http-status-codes";

type ProductQueryType = {
  limit: string;
  skip: string;
  search: string;
};

class ProductControllerClass {
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
}

const ProductController = new ProductControllerClass();

export default ProductController;
