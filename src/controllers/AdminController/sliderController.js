const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Slider = require("../../models/AdminPanelModule/slide");
const upload = require("../../middleware/multer");

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

exports.getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find();
    res.status(200).json({ success: true, message: "Sliders fetched successfully", data: sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch sliders", error: error.message });
  }
};

exports.addSlider = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: "File upload failed", error: err.message });

    try {
      if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });

      const { title, description } = req.body;
      const imageUrl = req.file.location;

      const newSlider = new Slider({ imageUrl, title, description });
      await newSlider.save();

      res.status(201).json({ success: true, message: "Slider added successfully", data: newSlider });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to add slider", error: error.message });
    }
  });
};

exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ success: false, message: "Slider not found" });

    const imageUrl = slider.imageUrl;
    if (imageUrl) {
      const imageKey = imageUrl.split("/").slice(-1)[0];
      const params = { Bucket: process.env.DO_SPACES_NAME, Key: `products/${imageKey}` };

      await s3.send(new DeleteObjectCommand(params));
    }

    await slider.deleteOne();
    res.status(200).json({ success: true, message: "Slider deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete slider", error: error.message });
  }
};
