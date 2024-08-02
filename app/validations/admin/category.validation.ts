import z from "zod";

export const createAndUpdateCategoryValidator = z.object({
  name: z
    .string()
    .min(3, "نام دسته بندی باید بین 3 تا 25 کاراکتر باشد")
    .max(25, "نام دسته بندی باید بین 3 تا 25 کاراکتر باشد"),
});