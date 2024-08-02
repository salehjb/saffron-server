import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../libs/db";
import { verifyToken } from "../libs/token";

export async function justAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken =
      req.cookies["access_token"] || req.headers.authorization;

    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "برای دسترسی به این مسیر لاگین کنید",
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    let decoded;
    try {
      decoded = verifyToken(accessToken) as { userId: string };
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        data: {
          message: "توکن نامعتبر",
          error: "JWT_EXPIRED",
        },
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded?.userId,
      },
    });

    if (user?.role !== "ADMIN") {
      return res.status(StatusCodes.FORBIDDEN).json({
        data: {
          message: "شما به این مسیر دسترسی ندارید",
        },
        status: StatusCodes.FORBIDDEN,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}
