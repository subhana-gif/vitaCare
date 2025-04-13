"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAndSaveToS3 = exports.uploadFileToS3 = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../config/s3"));
const uuid_1 = require("uuid");
const HttpStatus_1 = require("../enums/HttpStatus");
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
const uploadFileToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield s3_1.default.send(new client_s3_1.PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/uploads/${fileName}`;
        return { fileUrl, fileType };
    }
    catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Failed to upload file to S3");
    }
});
exports.uploadFileToS3 = uploadFileToS3;
const uploadAndSaveToS3 = (req, res, next) => {
    upload.single("image")(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ error: err.message });
        }
        if (req.file) {
            try {
                const { fileUrl } = yield (0, exports.uploadFileToS3)(req.file);
                req.body.imageUrl = fileUrl;
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Failed to upload image to S3" });
            }
        }
        next();
    }));
};
exports.uploadAndSaveToS3 = uploadAndSaveToS3;
