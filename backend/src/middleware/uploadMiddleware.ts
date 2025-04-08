import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3";
import { v4 as uuidv4 } from "uuid";
import { HttpStatus } from "../enums/HttpStatus";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/jfif", 
      "video/mp4", "video/mov", "video/avi", "video/webm", "video/mkv" 
    ];
      if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed.")as unknown as null, false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

export const uploadFileToS3 = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const fileType = file.mimetype.startsWith("video") ? "video" : "image";

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/uploads/${fileName}`;
    return { fileUrl, fileType }; 
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const uploadAndSaveToS3 = (req: Request, res: Response, next: NextFunction) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: err.message });
    }
    if (req.file) {
      try {
        const { fileUrl } = await uploadFileToS3(req.file);
        req.body.imageUrl = fileUrl; 
      } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Failed to upload image to S3" });
      }
    }

    next();
  });
};
