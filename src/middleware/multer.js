const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.DO_SPACES_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `DigitalStore/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;