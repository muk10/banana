const multer = require("multer");

const storage = multer.memoryStorage();

// File size limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs are allowed"), false);
  }
};

// Upload middleware for images
const uploadImages = multer({
  storage: storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFilter,
});

// Upload middleware for documents
const uploadDocuments = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: documentFilter,
});

// Upload middleware for payment proofs
const uploadPaymentProof = multer({
  storage: storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFilter,
});

module.exports = {
  uploadImages,
  uploadDocuments,
  uploadPaymentProof,
};