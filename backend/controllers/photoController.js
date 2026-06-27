 const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }
    const photos = req.files.map((file) => ({
      url: file.path || file.secure_url,
      isMain: false,
      public_id: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully to Cloudinary",
      photos: photos 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 
module.exports = { uploadPhotos };
