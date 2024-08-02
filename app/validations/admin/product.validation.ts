import { z } from "zod";

export const createProductValidator = z.object({
  name: z
    .string()
    .min(4, "نام محصول باید بین 4 تا 35 کاراکتر باشد")
    .max(35, "نام محصول باید بین 4 تا 35 کاراکتر باشد"),
  description: z.string(),
  price: z
    .string()
    .min(1, "وارد کردن مبلغ اجباری است")
    .transform((v) => parseInt(v)),
  categoryId: z.string({
    required_error: "وارد کردن دسته بندی محصول اجباری میباشد",
  }),
});
