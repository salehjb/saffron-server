import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../libs/validate-schema";
import {
  checkOtpValidator,
  loginValidator,
  registerValidator,
} from "../validations/auth.validation";
import { db } from "../libs/db";
import { StatusCodes } from "http-status-codes";
import { otpGenerator } from "../libs";
import { generateToken, verifyToken } from "../libs/token";

class AuthControllerClass {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber } = await validateSchema(loginValidator, req, res);

      const user = await db.user.findUnique({
        where: {
          phoneNumber,
        },
      });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "کاربری با این شماره همراه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      const otp = {
        code: otpGenerator(),
        expiresIn: new Date(Date.now() + 2 * 60 * 1000),
      };

      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          otp,
        },
      });

      return res.status(StatusCodes.OK).json({
        data: {
          message: "کد به شماره همراه ارسال شد",
          otp,
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, phoneNumber } = await validateSchema(
        registerValidator,
        req,
        res
      );

      const existingUserWithPhoneNumber = await db.user.findUnique({
        where: {
          phoneNumber,
        },
      });

      if (existingUserWithPhoneNumber) {
        return res.status(StatusCodes.CONFLICT).json({
          data: {
            message: "این شماره از قبل در سیستم موجود میباشد",
          },
          status: StatusCodes.CONFLICT,
        });
      }

      const otp = {
        code: otpGenerator(),
        expiresIn: new Date(Date.now() + 2 * 60 * 1000),
      };

      const user = await db.user.create({
        data: {
          fullName,
          phoneNumber,
          otp,
        },
      });

      await db.cart.create({
        data: {
          userId: user.id,
        },
      });

      return res.status(StatusCodes.CREATED).json({
        data: {
          message: "کد به شماره همراه ارسال شد",
          otp,
        },
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, phoneNumber } = await validateSchema(
        checkOtpValidator,
        req,
        res
      );

      const user = await db.user.findUnique({
        where: {
          phoneNumber,
        },
      });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          data: {
            message: "کاربری با این شماره همراه یافت نشد",
          },
          status: StatusCodes.NOT_FOUND,
        });
      }

      // check otp is correct
      if (user?.otp.code !== +code) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          data: {
            message: "کد otp وارد شده صحیح نمیباشد",
            error: "OTP_INCORRECT",
          },
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      // check otp is expired
      if (new Date(user.otp.expiresIn) < new Date(Date.now())) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          data: {
            message: "تاریخ انقضا otp به پایان رسیده است",
            error: "OTP_EXPIRED",
          },
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      const accessToken = generateToken({ userId: user.id }, "1h");
      const refreshToken = generateToken({ userId: user.id }, "30d");

      return res.status(StatusCodes.OK).json({
        data: {
          message: "ورود به حساب موفقیت آمیز بود",
          accessToken,
          refreshToken,
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.cookies["refreshToken"] ||
        req.headers["refreshToken"] ||
        req.body.refreshToken;

      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          data: {
            message: "رفرش توکن ارسال نشده است",
          },
          status: StatusCodes.UNAUTHORIZED,
        });
      }

      const decoded = verifyToken(refreshToken) as { userId: string };
      const newAccessToken = generateToken({ userId: decoded.userId }, "1h");
      const newRefreshToken = generateToken({ userId: decoded.userId }, "30d");

      return res.status(StatusCodes.OK).json({
        data: {
          message: "تازه سازی توکن موفقیت آمیز بود",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        status: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  }
}

const AuthController = new AuthControllerClass();

export default AuthController;
