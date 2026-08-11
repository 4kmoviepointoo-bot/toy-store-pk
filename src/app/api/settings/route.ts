import { createSafeRoute, apiSuccess } from "@/lib/api-wrapper";
import * as settingsController from "@/controllers/settings.controller";

export const GET = createSafeRoute(async () => {
  const settings = await settingsController.getSettings();
  return apiSuccess(settings);
});
