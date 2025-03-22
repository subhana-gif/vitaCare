"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
class FileUploadService {
    async uploadProfileImage(file) {
        const { fileUrl } = await (0, uploadMiddleware_1.uploadFileToS3)(file);
        return fileUrl;
    }
}
exports.default = new FileUploadService();
