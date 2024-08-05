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

export const updateProductValidator = z.object({
  name: z
    .string()
    .min(4, "نام محصول باید بین 4 تا 35 کاراکتر باشد")
    .max(35, "نام محصول باید بین 4 تا 35 کاراکتر باشد")
    .or(z.literal(undefined)),
  description: z.string().or(z.literal(undefined)),
  price: z
    .string()
    .min(1, "وارد کردن مبلغ اجباری است")
    .transform((v) => parseInt(v))
    .or(z.literal(undefined)),
  categoryId: z
    .string({
      required_error: "وارد کردن دسته بندی محصول اجباری میباشد",
    })
    .or(z.literal(undefined)),
});

export const changeIsActiveValidator = z.object({
  isActive: z.boolean({
    required_error: "وارد کردن مقدار isActive اجباری میباشد",
  }),
});
