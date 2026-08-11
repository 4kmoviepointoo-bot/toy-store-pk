import { connectToDatabase } from "@/lib/mongodb";

const COLLECTION = "settings";
const SETTINGS_KEY = "shipping";

export interface ShippingSettings {
  freeDeliveryThreshold: number;
  isThresholdEnabled: boolean;
  minProductPriceForFreeDelivery: number;
  isProductPriceRuleActive: boolean;
}

const DEFAULTS: ShippingSettings = {
  freeDeliveryThreshold: 2500,
  isThresholdEnabled: true,
  minProductPriceForFreeDelivery: 2500,
  isProductPriceRuleActive: true,
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const { db } = await connectToDatabase();
    const doc = await db.collection(COLLECTION).findOne({ key: SETTINGS_KEY });
    if (!doc) return { ...DEFAULTS };
    return {
      freeDeliveryThreshold: doc.freeDeliveryThreshold ?? DEFAULTS.freeDeliveryThreshold,
      isThresholdEnabled: doc.isThresholdEnabled ?? DEFAULTS.isThresholdEnabled,
      minProductPriceForFreeDelivery: doc.minProductPriceForFreeDelivery ?? DEFAULTS.minProductPriceForFreeDelivery,
      isProductPriceRuleActive: doc.isProductPriceRuleActive ?? DEFAULTS.isProductPriceRuleActive,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function updateShippingSettings(fields: Partial<ShippingSettings>): Promise<ShippingSettings> {
  const { db } = await connectToDatabase();

  const updateData: Record<string, unknown> = {};
  if (fields.freeDeliveryThreshold !== undefined) updateData.freeDeliveryThreshold = fields.freeDeliveryThreshold;
  if (fields.isThresholdEnabled !== undefined) updateData.isThresholdEnabled = fields.isThresholdEnabled;
  if (fields.minProductPriceForFreeDelivery !== undefined) updateData.minProductPriceForFreeDelivery = fields.minProductPriceForFreeDelivery;
  if (fields.isProductPriceRuleActive !== undefined) updateData.isProductPriceRuleActive = fields.isProductPriceRuleActive;

  await db.collection(COLLECTION).updateOne(
    { key: SETTINGS_KEY },
    { $set: { key: SETTINGS_KEY, ...updateData } },
    { upsert: true }
  );

  return getShippingSettings();
}
