const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment variables.
// Requires dotenv to be loaded before this module is required (see src/index.js).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
