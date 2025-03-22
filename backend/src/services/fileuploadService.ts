import { uploadFileToS3 } from "../middleware/uploadMiddleware";

class FileUploadService {
  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    const { fileUrl } = await uploadFileToS3(file);
    return fileUrl;
  }
}

export default new FileUploadService();
