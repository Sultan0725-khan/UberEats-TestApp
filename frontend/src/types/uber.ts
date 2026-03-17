export interface EnergyInfo {
  lower_range?: number;
  upper_range?: number;
}

export interface PriceOverride {
  context_type: string;
  context_value: string;
  price: number;
}

export interface PriceInfo {
  price?: number;
  core_price?: number;
  container_deposit?: number;
  overrides?: PriceOverride[];
}

export interface TaxInfo {
  tax_rate?: number;
  vat_rate_percentage?: number;
}

export interface NutritionalInfo {
  calories?: EnergyInfo;
  kilojoules?: EnergyInfo;
  allergens?: string[];
}

export interface Classification {
  classification: string;
}

export interface DishInfo {
  classifications?: Classification[];
}

export interface ProductInfo {
  product_type?: string;
  gtin?: string;
  plu?: string;
  merchant_supplied_id?: string;
  product_traits?: string[];
  countries_of_origin?: string[];
}

export interface PhysicalProperties {
  reusable_packaging?: boolean;
}

export interface SuspensionInfo {
  suspension?: {
    suspend_until?: number;
    reason?: string;
  };
}

export interface UpdateItemRequest {
  title?: { translations: Record<string, string> };
  description?: { translations: Record<string, string> };
  image_url?: string;
  price_info?: PriceInfo;
  tax_info?: TaxInfo;
  nutritional_info?: NutritionalInfo;
  dish_info?: DishInfo;
  product_info?: ProductInfo;
  physical_properties?: PhysicalProperties;
  suspension_info?: SuspensionInfo;
  suspend_until?: number;
}

export interface UberOrder {
  id: string;
  display_id?: string;
  current_state: string;
  placed_at: string;
  store_id?: string;
}
