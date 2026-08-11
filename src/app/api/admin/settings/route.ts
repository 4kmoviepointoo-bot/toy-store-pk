import { NextRequest } from "next/server";
import { createSafeRoute, apiSuccess, apiError } from "@/lib/api-wrapper";
import { verifyAdminSession } from "@/lib/auth";
import * as settingsController from "@/controllers/settings.controller";

export const GET = createSafeRoute(async () => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const settings = await settingsController.getSettings();
  return apiSuccess(settings);
});

export const PATCH = createSafeRoute(async (request: NextRequest) => {
  const authed = await verifyAdminSession();
  if (!authed) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, "VALIDATION_ERROR");
  }

  const settings = await settingsController.saveSettings(body);
  return apiSuccess({ settings });
});
