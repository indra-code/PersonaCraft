import { promises as fs } from "fs";
import path from "path";
import webmToMp4 from "webm-to-mp4";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const inputPath = path.join(process.cwd(), "public", "input.webm");
    const outputPath = path.join(process.cwd(), "public", "output.mp4");

    // Read the input WebM file
    const webmBuffer = await fs.readFile(inputPath);

    // Convert to MP4
    const mp4Buffer = Buffer.from(webmToMp4(webmBuffer));

    // Save the MP4 file
    await fs.writeFile(outputPath, mp4Buffer);

    return res
      .status(200)
      .json({ message: "Conversion successful", output: "/output.mp4" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
