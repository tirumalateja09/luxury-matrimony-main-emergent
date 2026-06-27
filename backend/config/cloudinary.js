const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const PDF_MIME_TYPES = ['application/pdf'];
const OFFICE_MIME_TYPES = DOCUMENT_MIME_TYPES.filter(
  (mimeType) => !PDF_MIME_TYPES.includes(mimeType),
);
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES];

const sanitizeFileName = (fileName) =>
  fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const getNormalizedExtension = (file) =>
  path.extname(file.originalname || '').toLowerCase();

const isImageFile = (file) =>
  IMAGE_MIME_TYPES.includes(file.mimetype) ||
  ['.jpg', '.jpeg', '.png'].includes(getNormalizedExtension(file));

const isPdfFile = (file) =>
  PDF_MIME_TYPES.includes(file.mimetype) ||
  getNormalizedExtension(file) === '.pdf';

const isOfficeDocumentFile = (file) =>
  OFFICE_MIME_TYPES.includes(file.mimetype) ||
  ['.doc', '.docx'].includes(getNormalizedExtension(file));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
   secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'matrimonial_profiles', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Auto-optimization
  },
});

const upload = multer({ storage: storage });

const mixedFileFilter = (req, file, cb) => {
  if (
    ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    isImageFile(file) ||
    isPdfFile(file) ||
    isOfficeDocumentFile(file)
  ) {
    cb(null, true);
    return;
  }

  cb(new Error('Only JPG, PNG, PDF, DOC, and DOCX files are allowed'));
};

const mixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isImage = isImageFile(file);
    const isPdf = isPdfFile(file);
    const isOfficeDocument = isOfficeDocumentFile(file);
    const extension = getNormalizedExtension(file);
    const safeBaseName = sanitizeFileName(file.originalname || 'file') || 'file';

    return {
      folder: 'matrimonial_uploads',
      resource_type: 'auto', 
      type: 'upload',        
      access_mode: 'public',  

      public_id: isOfficeDocument
        ? `${safeBaseName}-${Date.now()}${extension}`
        : `${safeBaseName}-${Date.now()}`,
      format: isPdf ? 'pdf' : undefined,
      ...(isImage
        ? { transformation: [{ width: 1000, height: 1000, crop: 'limit' }] }
        : {}),
    };
  },
});

const uploadMixedFiles = multer({
  storage: mixedStorage,
  fileFilter: mixedFileFilter,
});

module.exports = { cloudinary, upload, uploadMixedFiles };
