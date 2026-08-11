import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { verifyAdminSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const POST = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return apiError("No file provided", 400, "VALIDATION_ERROR");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiError("Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG", 400, "VALIDATION_ERROR");
  }

  if (file.size > MAX_FILE_SIZE) {
    return apiError("File too large. Maximum size is 5MB", 400, "VALIDATION_ERROR");
  }

  // Ensure uploads directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Generate unique filename
  const ext = path.extname(file.name) || ".png";
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50);
  const filename = `${timestamp}-${safeName}${ext}`;

  // Convert file to buffer and write
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const publicUrl = `/uploads/${filename}`;

  return apiSuccess({ url: publicUrl, filename });
});
