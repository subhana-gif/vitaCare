"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAndSaveToS3 = exports.uploadFileToS3 = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../config/s3"));
const uuid_1 = require("uuid");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (_req, file, callback) => {
        const allowedTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/jfif",
            "video/mp4", "video/mov", "video/avi", "video/webm", "video/mkv"
        ];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadFileToS3 = async (file) => {
    if (!file) {
        throw new Error("No file provided");
    }
    try {
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
        const fileType = file.mimetype.startsWith("video") ? "video" : "image";
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${fileName}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        await s3_1.default.send(new client_s3_1.PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/uploads/${fileName}`;
        return { fileUrl, fileType };
    }
    catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Failed to upload file to S3");
    }
};
exports.uploadFileToS3 = uploadFileToS3;
const uploadAndSaveToS3 = (req, res, next) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (req.file) {
            try {
                const { fileUrl } = await (0, exports.uploadFileToS3)(req.file);
                req.body.imageUrl = fileUrl;
            }
            catch (error) {
                return res.status(500).json({ error: "Failed to upload image to S3" });
            }
        }
        next();
    });
};
exports.uploadAndSaveToS3 = uploadAndSaveToS3;
