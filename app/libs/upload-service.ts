import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileNameFromUrl } from "./index";

export async function generateSignedUploadUrl(
  key: string,
  filetype: string,
  dir?: string
) {
  try {
    const s3Client = new S3Client({
      endpoint: `https://${process.env.LIARA_ENDPOINT}`,
      region: "default",
      credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY as string,
        secretAccessKey: process.env.LIARA_SECRET_KEY as string,
      },
    });
    const params = {
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: dir ? `${dir}/${key}` : key,
      ContentType: filetype,
    };
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // 1 hour
    return signedUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFileUsingSignedUrl(
  signedUrl: string,
  file: Express.Multer.File
) {
  try {
    await fetch(signedUrl, {
      method: "PUT",
      body: file.buffer,
      headers: {
        "Content-Type": file.mimetype,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFileFromCloud(filename: string, dir?: string) {
  try {
    const s3Client = new S3Client({
      region: "default",
      endpoint: `https://${process.env.LIARA_ENDPOINT}`,
      credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY as string,
        secretAccessKey: process.env.LIARA_SECRET_KEY as string,
      },
    });
    const params = {
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: dir ? `${dir}/${filename}` : filename,
    };
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.log(error);
  }
}

function fileNamePured(filename: string) {
  const trimmedFilename = filename.endsWith(".")
    ? filename.slice(0, -1)
    : filename;
  const replacedString = trimmedFilename.replace(/[. ]+/g, "-");
  return replacedString.replace(/-+/g, "-");
}

export async function uploadFiles(
  files: Express.Multer.File[] | undefined,

  fileDirectory?: string,
  prevFileUrls?: string[]
) {
  try {
    if (files && files.length > 0) {
      const uploadedFileUrls: string[] = [];

      if (prevFileUrls && prevFileUrls.length > 0) {
        for (const prevFileUrl of prevFileUrls) {
          const prevFileName = fileNameFromUrl(prevFileUrl);
          await deleteFileFromCloud(prevFileName);
        }
      }

      for (const file of files) {
        const imageName = `${Date.now().toString()}-${fileNamePured(
          file.originalname
        )}`;
        const imageUrl = `https://${process.env.LIARA_BUCKET_NAME}.${
          process.env.LIARA_ENDPOINT
        }${fileDirectory ? `/${fileDirectory}` : ""}/${imageName}`;

        const signedUrl = await generateSignedUploadUrl(
          imageName,
          file.mimetype,
          fileDirectory
        );

        await uploadFileUsingSignedUrl(signedUrl as string, file);
        uploadedFileUrls.push(imageUrl);
      }

      return uploadedFileUrls;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
