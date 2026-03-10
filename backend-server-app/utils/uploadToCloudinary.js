const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = (buffer, folder = "zakat-platform") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        transformation: [
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};

