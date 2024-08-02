import z from "zod";
import { MOBILE_REGEX } from "../../regexes";

export const editUserValidator = z.object({
  fullName: z
    .string()
    .min(4, "نام و نام خانوادگی باید بین 4 تا 30 کاراکتر باشد")
    .max(30, "نام و نام خانوادگی باید بین 4 تا 30 کاراکتر باشد")
    .optional(),
  phoneNumber: z
    .string()
    .regex(MOBILE_REGEX, "شماره موبایل وارد شده اشتباه است")
    .optional(),
  role: z
    .enum(["USER", "ADMIN"], {
      message: "نقش وارد شده صحیح نمیباشد",
    })
    .optional(),
});
