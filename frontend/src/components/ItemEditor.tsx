import React, { useState } from "react";
import type { UpdateItemRequest, PriceOverride } from "../types/uber";
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onReset?: () => void;
  defaultExpanded?: boolean;
}

const FormSection: React.FC<SectionProps> = ({
  title,
  description,
  children,
  onReset,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-surface/30 border border-border rounded-xl overflow-hidden">
      <div
        className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surfaceHover/30 hover:bg-surfaceHover/50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-textMuted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-textMuted" />
          )}
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-xs text-textMuted mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {onReset && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-danger bg-surface border border-border px-2 py-1 rounded transition-colors"
            title="Reset this section"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
      {expanded && <div className="p-5 space-y-6">{children}</div>}
    </div>
  );
};

// --- Form Controls ---

const Label = ({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip?: string;
}) => (
  <label
    className="text-xs font-mono text-orange-500 uppercase font-bold block opacity-80 mb-1.5"
    title={tooltip}
  >
    {children}
  </label>
);

interface NumberInputProps {
  label: string;
  value?: number;
  onChange: (val?: number) => void;
  placeholder?: string;
  tooltip?: string;
  step?: string;
  isCents?: boolean;
}

const NumberInput = ({
  label,
  value,
  onChange,
  placeholder,
  tooltip,
  step = "1",
  isCents = false,
}: NumberInputProps) => {
  const displayValue = value === undefined ? "" : isCents ? value / 100 : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      onChange(undefined);
      return;
    }
    const num = parseFloat(e.target.value);
    onChange(isCents ? Math.round(num * 100) : num);
  };

  return (
    <div>
      <Label tooltip={tooltip}>
        {label} {isCents ? "(EUR)" : ""}
      </Label>
      <input
        type="number"
        step={step}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#151515] border border-border p-2 rounded text-sm text-emerald-400 font-mono focus:outline-none focus:border-primary"
      />
    </div>
  );
};

interface TextInputProps {
  label: string;
  value?: string;
  onChange: (val?: string) => void;
  placeholder?: string;
  tooltip?: string;
}

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  tooltip,
}: TextInputProps) => (
  <div>
    <Label tooltip={tooltip}>{label}</Label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={placeholder}
      className="w-full bg-[#151515] border border-border p-2 rounded text-sm text-green-300 font-mono focus:outline-none focus:border-primary"
    />
  </div>
);

interface ToggleProps {
  label: string;
  checked?: boolean;
  onChange: (val: boolean) => void;
  tooltip?: string;
}

const Toggle = ({ label, checked, onChange, tooltip }: ToggleProps) => (
  <div
    className="flex items-center justify-between p-3 bg-[#151515] border border-border rounded cursor-pointer"
    onClick={() => onChange(!checked)}
    title={tooltip}
  >
    <span className="text-sm font-medium text-white">{label}</span>
    <div
      className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? "bg-primary" : "bg-surface"}`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </div>
  </div>
);

interface MultiSelectArrayProps {
  label: string;
  options: string[];
  values?: string[];
  onChange: (vals?: string[]) => void;
  tooltip?: string;
}

const MultiSelectArray = ({
  label,
  options,
  values,
  onChange,
  tooltip,
}: MultiSelectArrayProps) => {
  const safeValues = Array.isArray(values) ? values : [];

  const toggle = (opt: string) => {
    if (safeValues.includes(opt)) {
      onChange(
        safeValues.filter((v: string) => v !== opt).length > 0
          ? safeValues.filter((v: string) => v !== opt)
          : undefined,
      );
    } else {
      onChange([...safeValues, opt]);
    }
  };

  return (
    <div>
      <Label tooltip={tooltip}>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              safeValues.includes(opt)
                ? "bg-primary/20 border-primary text-primary"
                : "bg-[#151515] border-border text-textMuted hover:text-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Sub-Sections ---

const PriceTaxSection = ({
  data,
  onChange,
}: {
  data: UpdateItemRequest;
  onChange: (d: UpdateItemRequest) => void;
}) => {
  const priceInfo = data.price_info || {};
  const taxInfo = data.tax_info || {};

  const updatePrice = (key: string, val: unknown) => {
    onChange({ ...data, price_info: { ...priceInfo, [key]: val } });
  };
  const updateTax = (key: string, val: unknown) => {
    onChange({ ...data, tax_info: { ...taxInfo, [key]: val } });
  };

  const addOverride = () => {
    const list = priceInfo.overrides || [];
    onChange({
      ...data,
      price_info: {
        ...priceInfo,
        overrides: [
          ...list,
          { context_type: "STORE", context_value: "", price: 0 },
        ],
      },
    });
  };

  const updateOverride = (
    idx: number,
    field: keyof PriceOverride,
    val: any,
  ) => {
    const list = [...(priceInfo.overrides || [])];
    list[idx] = { ...list[idx], [field]: val };
    onChange({
      ...data,
      price_info: { ...priceInfo, overrides: list },
    });
  };

  const removeOverride = (idx: number) => {
    const list = [...(priceInfo.overrides || [])];
    list.splice(idx, 1);
    onChange({
      ...data,
      price_info: {
        ...priceInfo,
        overrides: list.length > 0 ? list : undefined,
      },
    });
  };

  return (
    <FormSection
      title="Price & Tax"
      description="Base price, container deposits, overrides, and VAT rates."
      onReset={() =>
        onChange({ ...data, price_info: undefined, tax_info: undefined })
      }
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm border-b border-border pb-2 text-white font-medium">
            Pricing
          </h4>
          <NumberInput
            label="Price (Cents)"
            value={priceInfo.price}
            onChange={(v) => updatePrice("price", v)}
            isCents
          />
          <NumberInput
            label="Core Price (Cents)"
            value={priceInfo.core_price}
            onChange={(v) => updatePrice("core_price", v)}
            isCents
          />
          <NumberInput
            label="Container Deposit (Cents)"
            value={priceInfo.container_deposit}
            onChange={(v) => updatePrice("container_deposit", v)}
            isCents
          />

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
              <Label>Price Overrides</Label>
              <button
                onClick={addOverride}
                className="text-xs flex items-center gap-1 text-primary hover:text-white transition-colors"
                title="Add a location or order-type specific override"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {priceInfo.overrides && priceInfo.overrides.length > 0 ? (
              <div className="space-y-3">
                {priceInfo.overrides.map((ov: PriceOverride, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-end bg-black/20 p-3 rounded border border-border/50 relative group"
                  >
                    <div className="flex-1 w-full">
                      <Label>Context Type</Label>
                      <select
                        value={ov.context_type}
                        onChange={(e) =>
                          updateOverride(idx, "context_type", e.target.value)
                        }
                        className="w-full bg-[#151515] border border-border p-2 rounded text-xs text-white focus:border-primary focus:outline-none"
                      >
                        <option value="STORE">STORE</option>
                        <option value="ORDER_TYPE">ORDER_TYPE</option>
                        <option value="FULFILLMENT_METHOD">
                          FULFILLMENT_METHOD
                        </option>
                      </select>
                    </div>
                    <div className="flex-1 w-full">
                      <TextInput
                        label="Context Value"
                        value={ov.context_value}
                        onChange={(v) =>
                          updateOverride(idx, "context_value", v || "")
                        }
                        placeholder="e.g. store-id or DINE_IN"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <NumberInput
                        label="Override Price"
                        value={ov.price}
                        onChange={(v) => updateOverride(idx, "price", v || 0)}
                        isCents
                      />
                    </div>
                    <button
                      onClick={() => removeOverride(idx)}
                      className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                      title="Remove Override"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-textMuted italic">
                No overrides defined.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm border-b border-border pb-2 text-white font-medium">
            Taxation
          </h4>
          <NumberInput
            label="VAT Rate (%)"
            value={taxInfo.vat_rate_percentage}
            onChange={(v) => updateTax("vat_rate_percentage", v)}
            step="0.1"
          />
          <NumberInput
            label="Base Tax Rate (%)"
            value={taxInfo.tax_rate}
            onChange={(v) => updateTax("tax_rate", v)}
            step="0.01"
            tooltip="Use vat_rate_percentage instead for EU/UK/AUS/NZ"
          />
        </div>
      </div>
    </FormSection>
  );
};

const NutritionDishSection = ({
  data,
  onChange,
}: {
  data: UpdateItemRequest;
  onChange: (d: UpdateItemRequest) => void;
}) => {
  const nut = data.nutritional_info || {};
  const dish = data.dish_info || {};

  const uNut = (key: string, val: unknown) =>
    onChange({ ...data, nutritional_info: { ...nut, [key]: val } });
  const uDish = (key: string, val: unknown) =>
    onChange({ ...data, dish_info: { ...dish, [key]: val } });

  const classificationsList = [
    "VEGETARIAN",
    "VEGAN",
    "GLUTEN_FREE",
    "HALAL",
    "KOSHER",
  ];
  const allergensList = [
    "PEANUTS",
    "TREE_NUTS",
    "MILK",
    "EGGS",
    "FISH",
    "SHELLFISH",
    "SOY",
    "WHEAT",
    "SESAME",
  ];

  const currentClassifications = Array.isArray(dish.classifications)
    ? dish.classifications.map((c: any) => c.classification || c)
    : [];

  const updateClassifications = (vals?: string[]) => {
    uDish(
      "classifications",
      vals?.map((v) => ({ classification: v })),
    );
  };

  return (
    <FormSection
      title="Nutrition & Dietary Info"
      description="Calories, allergens, and dietary classifications."
      onReset={() =>
        onChange({
          ...data,
          nutritional_info: undefined,
          dish_info: undefined,
        })
      }
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm border-b border-border pb-2 text-white font-medium">
              Energy
            </h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <NumberInput
                  label="Calories (Min)"
                  value={nut.calories?.lower_range}
                  onChange={(v) =>
                    uNut("calories", { ...nut.calories, lower_range: v })
                  }
                />
              </div>
              <div className="flex-1">
                <NumberInput
                  label="Calories (Max)"
                  value={nut.calories?.upper_range}
                  onChange={(v) =>
                    uNut("calories", { ...nut.calories, upper_range: v })
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <NumberInput
                  label="Kilojoules (Min)"
                  value={nut.kilojoules?.lower_range}
                  onChange={(v) =>
                    uNut("kilojoules", { ...nut.kilojoules, lower_range: v })
                  }
                />
              </div>
              <div className="flex-1">
                <NumberInput
                  label="Kilojoules (Max)"
                  value={nut.kilojoules?.upper_range}
                  onChange={(v) =>
                    uNut("kilojoules", { ...nut.kilojoules, upper_range: v })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm border-b border-border pb-2 text-white font-medium">
              Tags & Allergens
            </h4>
            <MultiSelectArray
              label="Dietary Classifications"
              options={classificationsList}
              values={currentClassifications}
              onChange={updateClassifications}
            />
            <div className="mt-4">
              <MultiSelectArray
                label="Allergens"
                options={allergensList}
                values={nut.allergens}
                onChange={(vals) => uNut("allergens", vals)}
              />
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

const ProductPropertiesSection = ({
  data,
  onChange,
}: {
  data: UpdateItemRequest;
  onChange: (d: UpdateItemRequest) => void;
}) => {
  const prod = data.product_info || {};
  const phys = data.physical_properties || {};

  const uProd = (key: string, val: unknown) =>
    onChange({ ...data, product_info: { ...prod, [key]: val } });
  const uPhys = (key: string, val: unknown) =>
    onChange({ ...data, physical_properties: { ...phys, [key]: val } });

  return (
    <FormSection
      title="Product & Physical Properties"
      description="GTIN, PLU, item type, and packaging."
      onReset={() =>
        onChange({
          ...data,
          product_info: undefined,
          physical_properties: undefined,
        })
      }
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <TextInput
            label="GTIN (Barcode)"
            value={prod.gtin}
            onChange={(v) => uProd("gtin", v)}
            placeholder="e.g. 00012345678905"
          />
          <TextInput
            label="PLU (Price Look-up)"
            value={prod.plu}
            onChange={(v) => uProd("plu", v)}
            placeholder="e.g. 4011"
          />
          <TextInput
            label="Merchant Supplied ID"
            value={prod.merchant_supplied_id}
            onChange={(v) => uProd("merchant_supplied_id", v)}
            placeholder="SKU or internal ID"
          />
        </div>
        <div className="space-y-4 flex flex-col justify-start">
          <TextInput
            label="Product Type"
            value={prod.product_type}
            onChange={(v) => uProd("product_type", v)}
            placeholder="e.g. PREPARED_FOOD"
          />
          <Toggle
            label="Reusable Packaging"
            checked={phys.reusable_packaging === true}
            onChange={(v: boolean) =>
              uPhys("reusable_packaging", v ? true : undefined)
            }
          />
        </div>
      </div>
    </FormSection>
  );
};

const SuspensionSection = ({
  data,
  onChange,
}: {
  data: UpdateItemRequest;
  onChange: (d: UpdateItemRequest) => void;
}) => {
  const isSuspended = data.suspend_until && data.suspend_until > 0;

  // Constants
  const INDEFINITE_YEARS = 10;
  const indefiniteSeconds = INDEFINITE_YEARS * 365 * 24 * 60 * 60;

  // Stable timestamps for render phase to satisfy React purity rules
  const [nowSecs] = React.useState(() => Math.floor(Date.now() / 1000));
  const [endOfTodaySecs] = React.useState(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return Math.floor(end.getTime() / 1000);
  });

  // Derive mode from suspend_until
  let suspendMode = "inactive";
  let customDateStr = "";

  if (isSuspended && data.suspend_until) {
    const diff = data.suspend_until - nowSecs;

    if (diff > 5 * 365 * 24 * 60 * 60) {
      suspendMode = "indefinite";
    } else {
      // Check if it's "end of today" (within a few seconds of today's 23:59:59)
      if (Math.abs(data.suspend_until - endOfTodaySecs) < 60) {
        suspendMode = "today";
      } else {
        suspendMode = "custom";
        // Format for datetime-local: YYYY-MM-DDThh:mm
        const d = new Date(data.suspend_until * 1000);
        const pad = (n: number) => n.toString().padStart(2, "0");
        customDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }
  }

  const handleToggle = (active: boolean) => {
    if (!active) {
      // Suspend today by default when toggled off
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      onChange({
        ...data,
        suspend_until: Math.floor(endOfToday.getTime() / 1000),
      });
    } else {
      onChange({ ...data, suspend_until: 0 });
    }
  };

  const setSuspendMode = (mode: string) => {
    const nowSecs = Math.floor(Date.now() / 1000);

    if (mode === "indefinite") {
      onChange({ ...data, suspend_until: nowSecs + indefiniteSeconds });
    } else if (mode === "today") {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      onChange({
        ...data,
        suspend_until: Math.floor(endOfToday.getTime() / 1000),
      });
    } else if (mode === "custom") {
      // Just set to current time as default for custom picker, if no valid time exists
      onChange({ ...data, suspend_until: nowSecs });
    }
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const d = new Date(e.target.value);
    if (!isNaN(d.getTime())) {
      onChange({ ...data, suspend_until: Math.floor(d.getTime() / 1000) });
    }
  };

  return (
    <FormSection
      title="Suspension & Availability"
      description="Verwalte die Verfügbarkeit dieses Artikels."
      onReset={() =>
        onChange({
          ...data,
          suspend_until: undefined,
          suspension_info: undefined,
        })
      }
      defaultExpanded={false}
    >
      <div className="flex flex-col gap-6">
        <div className="w-full md:w-64">
          <Toggle
            label={isSuspended ? "Artikel ausverkauft" : "Artikel verfügbar"}
            checked={isSuspended ? true : false}
            onChange={(checked: boolean) => handleToggle(!checked)}
          />
        </div>

        {isSuspended && (
          <div className="flex flex-col gap-4 pl-4 border-l-2 border-border">
            <h4 className="text-sm font-semibold text-white">
              Ausverkauft Optionen:
            </h4>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="suspendMode"
                value="indefinite"
                checked={suspendMode === "indefinite"}
                onChange={() => setSuspendMode("indefinite")}
                className="w-4 h-4 text-primary bg-[#151515] border-border focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-textMain group-hover:text-white transition-colors">
                Auf unbestimmte Zeit ausverkauft
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="suspendMode"
                value="today"
                checked={suspendMode === "today"}
                onChange={() => setSuspendMode("today")}
                className="w-4 h-4 text-primary bg-[#151515] border-border focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-textMain group-hover:text-white transition-colors">
                Heute ausverkauft (bis zum Ende des Tages)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="suspendMode"
                value="custom"
                checked={suspendMode === "custom"}
                onChange={() => setSuspendMode("custom")}
                className="w-4 h-4 text-primary bg-[#151515] border-border focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-textMain group-hover:text-white transition-colors">
                Benutzerdefiniertes Datum & Uhrzeit
              </span>
            </label>

            {suspendMode === "custom" && (
              <div className="mt-2 ml-7">
                <Label tooltip="Wähle das genaue Datum und die Uhrzeit, wann der Artikel wieder verfügbar sein soll.">
                  Wählen Sie Datum und Uhrzeit
                </Label>
                <input
                  type="datetime-local"
                  value={customDateStr}
                  onChange={handleCustomDateChange}
                  className="w-full max-w-sm bg-[#151515] border border-border p-2 rounded text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {data.suspend_until && (
              <p className="text-xs text-textMuted mt-2 ml-7 bg-surface p-2 rounded inline-block">
                <span className="font-semibold text-emerald-400">
                  UNIX Timestamp:
                </span>{" "}
                {data.suspend_until}
                <br />
                <span className="font-semibold text-blue-400">
                  Wieder verfügbar ab:
                </span>{" "}
                {new Date(data.suspend_until * 1000).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </FormSection>
  );
};

// --- Main Editor Component ---

interface ItemEditorProps {
  data: UpdateItemRequest;
  onChange: (data: UpdateItemRequest) => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({ data, onChange }) => {
  // The ItemEditor receives the JSON standard object.
  // It passes it down to sections.

  return (
    <div className="space-y-4">
      <PriceTaxSection data={data} onChange={onChange} />
      <NutritionDishSection data={data} onChange={onChange} />
      <ProductPropertiesSection data={data} onChange={onChange} />
      <SuspensionSection data={data} onChange={onChange} />
    </div>
  );
};
