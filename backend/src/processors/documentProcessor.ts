import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".txt") {
    return await fs.readFile(filePath, "utf-8");
  }

  if (extension === ".pdf") {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${extension}`);
}