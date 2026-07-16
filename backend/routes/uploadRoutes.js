import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Setup memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

const uploadToCloudinary = (fileBuffer, folder = 'eyelitz') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
                folder: folder,
                resource_type: 'auto', // Accepts images, PDFs, etc.
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

router.post('/', protect, upload.single('file'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Determine folder path: optionally namespace it with the tenant's store ID for security/scoping
        const folder = `eyelitz/${req.storeId || 'general'}`;
        const result = await uploadToCloudinary(req.file.buffer, folder);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Cloudinary',
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            originalName: req.file.originalname,
        });
    } catch (err) {
        console.error('File Upload Error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file to Cloudinary',
            error: err.message,
        });
    }
});

export default router;