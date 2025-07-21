import { IncomingForm } from 'formidable';
import { UploadThing } from 'uploadthing';
import fs from 'fs';

// For Vercel: instruct it not to parse the body automatically
export const config = {
  api: {
    bodyParser: false
  }
};

const ut = new UploadThing({
  apiKey: process.env.UPLOADTHING_API_KEY    // Set this in your Vercel dashboard
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Parse the incoming file
  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Form parse error' });
      return;
    }

    const file = files.file; // "file" is the expected form-data field
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Read and upload the file
    const fileData = fs.createReadStream(file.filepath || file.path);

    try {
      const uploaded = await ut.uploadFile(fileData, file.originalFilename || file.name);
      res.status(200).json({ url: uploaded.url });
    } catch (err) {
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  });
                          }
        
