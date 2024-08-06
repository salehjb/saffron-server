import { z } from "zod";
import { MOBILE_REGEX } from "../../regexes";

export const createAddressValidator = z.object({
  province: z.string().min(1, "استان نمیتواند خالی باشد"),
  city: z.string().min(1, "شهر نمیتواند خالی باشد"),
  address: z.string().min(8, "آدرس نمیتواند کمتر از 8 کاراکتر باشد"),
  phoneNumber: z
    .string()
    .regex(MOBILE_REGEX, "شماره موبایل وارد شده اشتباه است"),
  houseNumber: z
    .string()
    .min(1, "وارد کردن پلاک خانه یا محل کار اجباری است")
    .transform((v) => parseInt(v)),
  floor: z
    .string()
    .min(1, "وارد کردن طبقه اجباری است")
    .transform((v) => parseInt(v)),
  unit: z
    .string()
    .min(1, "وارد کردن واحد اجباری است")
    .transform((v) => parseInt(v)),
  postalCode: z
    .string()
    .length(10, "کد پستی باید 10 رقم باشد")
    .transform((v) => parseInt(v)),
});
