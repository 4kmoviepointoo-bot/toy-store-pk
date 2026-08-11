import { ApiError } from "@/lib/api-wrapper";
import * as settingsService from "@/services/settings.service";

export async function getSettings() {
  return settingsService.getShippingSettings();
}

function cleanInt(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  return fallback;
}

export async function saveSettings(body: Record<string, unknown>) {
  const fields: Partial<settingsService.ShippingSettings> = {};

  if (body.freeDeliveryThreshold !== undefined) {
    fields.freeDeliveryThreshold = cleanInt(body.freeDeliveryThreshold, 2500);
  }
  if (body.isThresholdEnabled !== undefined) {
    fields.isThresholdEnabled = Boolean(body.isThresholdEnabled);
  }
  if (body.minProductPriceForFreeDelivery !== undefined) {
    fields.minProductPriceForFreeDelivery = cleanInt(body.minProductPriceForFreeDelivery, 2500);
  }
  if (body.isProductPriceRuleActive !== undefined) {
    fields.isProductPriceRuleActive = Boolean(body.isProductPriceRuleActive);
  }

  if (Object.keys(fields).length === 0) {
    throw new ApiError(400, "No fields to update", "VALIDATION_ERROR");
  }

  return settingsService.updateShippingSettings(fields);
}
