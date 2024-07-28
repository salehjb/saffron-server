// @ts-nocheck

import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AnyZodObject, ZodError, z } from "zod";

export async function validateSchema<T extends AnyZodObject>(
  schema: T,
  req: Request,
  res: Response
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      let errorsObj = {};
      for (const err of error.errors) {
        const errorKey = err.path[0] as string;
        const errorValue = err.message;
        errorsObj[errorKey] = errorValue;
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        data: {
          errors: errorsObj,
        },
        status: StatusCodes.BAD_REQUEST,
      });
    }
  }
}
