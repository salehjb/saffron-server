import { NextFunction, Request, Response } from "express";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants";
import multer from "multer";
import { StatusCodes } from "http-status-codes";

type UploadPermissionParamsType = {
  field_name: string;
  upload_required?: boolean;
  max_files?: number;
  max_file_size?: number;
  file_types?: string[];
};

export const uploadPermission = (params: UploadPermissionParamsType) => {
  const {
    field_name,
    upload_required = true,
    max_files = 5,
    max_file_size = MAX_FILE_SIZE,
    file_types = ACCEPTED_IMAGE_TYPES,
  } = params;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: max_file_size },
    fileFilter: (req, file, cb) => {
      if (file_types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("INVALID_FILE_TYPE"));
      }
    },
  }).array(field_name, max_files);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // handle file size error
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(StatusCodes.BAD_REQUEST).json({
              data: {
                message: `اندازه هر فایل نمیتواند بیش از ${(
                  max_file_size /
                  1024 /
                  1024
                ).toFixed(0)} مگابایت باشد`,
                error: "LIMIT_FILE_SIZE",
              },
              status: StatusCodes.BAD_REQUEST,
            });
          } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(StatusCodes.BAD_REQUEST).json({
              data: {
                message: `حداکثر تعداد فایل‌های مجاز برای آپلود ${max_files} عدد است.`,
                error: "LIMIT_UNEXPECTED_FILE",
              },
              status: StatusCodes.BAD_REQUEST,
            });
          }
        } else if (err instanceof Error) {
          if (err.message === "INVALID_FILE_TYPE") {
            return res.status(StatusCodes.BAD_REQUEST).json({
              data: {
                message: "تایپ فایل آپلود شده قابل پذیرش نیست",
                error: "INVALID_FILE_TYPE",
              },
              status: StatusCodes.BAD_REQUEST,
            });
          }
        }
      }

      if (upload_required) {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            data: {
              message: "آپلود حداقل یک فایل الزامی است",
              error: "NOT_UPLOADING_FILE",
            },
            status: StatusCodes.BAD_REQUEST,
          });
        }
      }

      next();
    });
  };
};
