import { IncomingForm } from "formidable";
import cloudinary from "cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary configuration from environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: "Form parse error" });
      return;
    }
    const file = files.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded. Field should be 'file'." });
      return;
    }

    try {
      // Cloudinary pe upload karo file ko
      const result = await cloudinary.v2.uploader.upload(file.filepath || file.path, {
        folder: "user_uploads",
        resource_type: "auto",
      });

      // Ab response me photo ki detail + uska link bhejo
      res.status(200).json({
        message: "File uploaded!",
        filename: file.originalFilename || file.name,
        size: file.size,
        mimetype: file.mimetype || file.type,
        url: result.secure_url,   // <-- yeh image ka public link hai
        public_id: result.public_id
      });
    } catch(uploadError) {
      res.status(500).json({
        error: "Cloudinary upload failed",
        details: uploadError.message
      });
    }
  });
        }
