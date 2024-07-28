import { MOBILE_REGEX } from "./../regexes/index";
import z from "zod";

export const loginValidator = z.object({
  phoneNumber: z
    .string()
    .regex(MOBILE_REGEX, "شماره موبایل وارد شده اشتباه است"),
});

export const registerValidator = z.object({
  fullName: z
    .string()
    .min(4, "نام و نام خانوادگی باید بین 4 تا 30 کاراکتر باشد")
    .max(30, "نام و نام خانوادگی باید بین 4 تا 30 کاراکتر باشد"),
  phoneNumber: z
    .string()
    .regex(MOBILE_REGEX, "شماره موبایل وارد شده اشتباه است"),
});

export const checkOtpValidator = z.object({
  code: z
    .string({
      required_error: "وارد کردن کد اجباری میباشد",
    })
    .length(6, "کد باید 6 رقم باشد"),
  phoneNumber: z
    .string()
    .regex(MOBILE_REGEX, "شماره موبایل وارد شده اشتباه است"),
});
