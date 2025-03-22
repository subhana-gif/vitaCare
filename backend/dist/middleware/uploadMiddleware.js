"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../config/s3"));
const uuid_1 = require("uuid");
const uploadFileToS3 = async (file) => {
    if (!file) {
        throw new Error("No file provided");
    }
    try {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `doctors/${fileName}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        await s3_1.default.send(new client_s3_1.PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/doctors/${fileName}`;
        return { fileUrl };
    }
    catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Failed to upload file to S3");
    }
};
exports.uploadFileToS3 = uploadFileToS3;
