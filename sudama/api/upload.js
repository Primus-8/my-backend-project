import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  // CORS for frontend use
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

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: "Form parse error" });
      return;
    }
    const file = files.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded. Field should be 'file'." });
      return;
    }
    res.status(200).json({
      message: "File mil gaya!",
      filename: file.originalFilename || file.name,
      size: file.size,
      mimetype: file.mimetype || file.type
    });
  });
      }
