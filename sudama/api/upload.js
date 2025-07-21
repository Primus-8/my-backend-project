import { IncomingForm } from "formidable";
import { UploadThing } from "uploadthing";
import fs from "fs";

// Needed so Vercel doesn't auto-parse the body
export const config = {
  api: {
    bodyParser: false,
  },
};

const ut = new UploadThing({
  apiKey: process.env.UPLOADTHING_API_KEY, // Check this in Vercel dashboard!
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    // Parse the form
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        res.status(500).json({ error: "Form parse error" });
        return;
      }

      const file = files.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Use .filepath for formidable v2 (Vercel prefers v2+)
      const filePath = file.filepath || file.path;
      const fileName = file.originalFilename || file.name;

      // Upload file using UploadThing
      try {
        const fileStream = fs.createReadStream(filePath);

        const uploaded = await ut.uploadFile(fileStream, fileName);
        res.status(200).json({ url: uploaded.url });
      } catch (uploadErr) {
        console.error("UploadThing error:", uploadErr);
        res.status(500).json({ error: "Upload failed", details: uploadErr.message });
      }
    });
  } catch (err) {
    console.error("Handler fail:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
          }
