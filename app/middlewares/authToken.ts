import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../libs/db";
import { verifyToken } from "../libs/token";

export async function authToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies["accessToken"] || req.headers.authorization;

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

    if (!user) return;

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}
