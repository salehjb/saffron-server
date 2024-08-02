import { z } from "zod";

export const createProductValidator = z.object({
  name: z
    .string()
    .min(4, "نام محصول باید بین 4 تا 35 کاراکتر باشد")
    .max(35, "نام محصول باید بین 4 تا 35 کاراکتر باشد"),
  description: z.string(),
  price: z
    .number({
      required_error: "وارد کردن مبلغ اجباری است",
    })
    .int("مبلغ باید از نوع اعداد صحیح باشد"),
  categoryId: z.string({
    required_error: "وارد کردن دسته بندی محصول اجباری میباشد",
  }),
});
