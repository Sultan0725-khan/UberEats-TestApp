import { useState } from "react";
import { Info, Trash2, ChevronRight, Settings } from "lucide-react";
import api from "../lib/api";
import { EndpointPanel } from "../components/EndpointPanel";
import { ItemEditor } from "../components/ItemEditor";
import type { UpdateItemRequest } from "../types/uber";

// --- Sub-components for Menu Rendering ---

const InfoTooltip = ({ content }: { content: string }) => (
  <div className="group relative inline-block ml-1.5">
    <Info className="w-3.5 h-3.5 text-textMuted hover:text-primary cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface border border-border rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-[10px] leading-relaxed text-textMain">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface"></div>
    </div>
  </div>
);

const MenuRenderer = ({ menu }: { menu: any }) => {
  if (!menu) return null;

  // 1. Identify Data Source
  // Uber returns some fields top-level (categories, items) and others inside a 'menus' list
  const mainMenu =
    menu.menus && Array.isArray(menu.menus) ? menu.menus[0] : menu;
  const allCategories = menu.categories || [];
  const allItems = menu.items || [];

  // Determine what categories to show
  // Some structures have mainMenu.categories (embedded), others have mainMenu.category_ids (referenced)
  let resolvedCategories = [];
  if (mainMenu.categories && Array.isArray(mainMenu.categories)) {
    resolvedCategories = mainMenu.categories;
  } else if (mainMenu.category_ids && Array.isArray(mainMenu.category_ids)) {
    resolvedCategories = mainMenu.category_ids
      .map((id: string) => allCategories.find((c: any) => c.id === id))
      .filter(Boolean);
  } else if (allCategories.length > 0) {
    // Fallback: Use all top-level categories if menu doesn't specify
    resolvedCategories = allCategories;
  }

  const getTranslation = (obj: any) => {
    if (!obj?.translations) return "No Title";
    const t = obj.translations;
    return (
      t.en ||
      t.en_us ||
      t["en-us"] ||
      t["en-US"] ||
      t.de ||
      Object.values(t)[0] ||
      "Untitled"
    );
  };

  if (resolvedCategories.length === 0 && allItems.length === 0) {
    return (
      <div className="mt-4 p-4 bg-surface/30 border border-dashed border-border rounded-lg text-textMuted text-xs font-mono">
        <p>No categories or items found in this menu.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-[#0a0a0a] border border-border rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-surface/50 p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">
              {mainMenu.menu_type || "MENU"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {getTranslation(mainMenu.title) || "Speisekarte"}
          </h3>
          {mainMenu.id && (
            <p className="text-[10px] font-mono mt-1 opacity-80">
              <span className="text-orange-500 font-bold uppercase tracking-tight">
                id:
              </span>{" "}
              <span className="text-textMuted">{mainMenu.id}</span>
            </p>
          )}
        </div>
        <div className="bg-surface p-3 rounded-lg border border-border/50">
          <p className="text-[10px] text-textMuted uppercase font-bold tracking-tighter mb-1">
            Service Availability
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mainMenu.service_availability &&
            Array.isArray(mainMenu.service_availability) ? (
              mainMenu.service_availability.map((sa: any, idx: number) => (
                <span
                  key={idx}
                  className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded"
                >
                  {sa.day_of_week}:{" "}
                  {sa.time_periods
                    ?.map((tp: any) => `${tp.start_time}-${tp.end_time}`)
                    .join(", ")}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-textMuted italic">
                No hours specified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-12">
        {resolvedCategories.map((cat: any, cidx: number) => (
          <section key={cat.id || cidx} className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <h4 className="text-lg font-bold text-white whitespace-nowrap">
                  {getTranslation(cat.title)}
                </h4>
                {cat.subtitle && (
                  <p className="text-xs text-textMuted">
                    {getTranslation(cat.subtitle)}
                  </p>
                )}
              </div>
              <div className="h-px w-full bg-gradient-to-r from-border to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {cat.entities && Array.isArray(cat.entities) ? (
                cat.entities.map((entity: any) => {
                  const item = allItems.find((i: any) => i.id === entity.id);
                  if (!item) return null;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row gap-6 p-5 bg-surfaceHover/20 border border-border/40 rounded-xl hover:border-border/80 transition-all hover:bg-surfaceHover/40 group relative overflow-hidden"
                    >
                      {/* Developer ID Tag */}
                      <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500/10 border-l border-b border-orange-500/20 rounded-bl-lg text-[10px] font-mono opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <span className="text-orange-500 font-bold uppercase tracking-tight">
                          id:
                        </span>{" "}
                        <span className="text-orange-300">{item.id}</span>
                      </div>

                      {/* Image */}
                      {item.image_url && typeof item.image_url === "string" && (
                        <div className="w-full md:w-32 h-32 md:h-32 rounded-lg overflow-hidden border border-border shrink-0 bg-[#101010]">
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-4">
                        {/* Title & Price */}
                        <div className="flex justify-between items-start gap-4 pt-4 md:pt-2">
                          <div className="flex-1">
                            <span className="text-[10px] font-mono text-orange-500 uppercase font-bold tracking-tight mb-0.5 block opacity-70">
                              title:
                            </span>
                            <h5 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                              {getTranslation(item.title)}
                            </h5>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-orange-500 uppercase font-bold tracking-tight mb-0.5 block opacity-70">
                              price:
                            </span>
                            <span className="text-lg font-mono text-emerald-400 font-bold">
                              {typeof item.price_info?.price === "number"
                                ? (item.price_info.price / 100).toLocaleString(
                                    "de-DE",
                                    { style: "currency", currency: "EUR" },
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <span className="text-[10px] font-mono text-orange-500 uppercase font-bold tracking-tight mb-0.5 block opacity-70">
                            description:
                          </span>
                          <p className="text-sm text-textMuted leading-relaxed max-w-2xl">
                            {getTranslation(item.description)}
                          </p>
                        </div>

                        {/* Metadata Badges */}
                        <div className="pt-2 flex flex-wrap gap-4 items-end">
                          {/* Ingredients */}
                          {(item.dish_info?.classifications?.ingredients || [])
                            .length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-orange-500 uppercase font-bold block opacity-70">
                                ingredients:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {item.dish_info.classifications.ingredients.map(
                                  (ing: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
                                    >
                                      {ing}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {/* Calories */}
                          {item.nutritional_info?.calories && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-orange-500 uppercase font-bold block opacity-70">
                                calories:
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 font-medium inline-block">
                                {typeof item.nutritional_info.calories ===
                                "object"
                                  ? `${item.nutritional_info.calories.lower_range || 0} - ${item.nutritional_info.calories.upper_range || 0}`
                                  : String(item.nutritional_info.calories)}{" "}
                                kcal
                              </span>
                            </div>
                          )}

                          {/* Tax */}
                          {item.tax_info?.vat_rate_percentage !== undefined && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-orange-500 uppercase font-bold block opacity-70">
                                vat_rate:
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-textMuted font-medium inline-block">
                                {item.tax_info.vat_rate_percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-textMuted">
                  Keine Artikel gefunden.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

// --- Main Components ---

// --- Helpers ---
const cleanObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    const arr = obj
      .map(cleanObject)
      .filter((v) => v !== undefined && v !== null);
    return arr.length > 0 ? arr : undefined;
  }
  if (obj !== null && typeof obj === "object") {
    const res: any = {};
    for (const key in obj) {
      const val = cleanObject(obj[key]);
      if (val !== undefined) {
        if (typeof val === "object" && Object.keys(val).length === 0) {
          // skip empty objects
        } else {
          res[key] = val;
        }
      }
    }
    return Object.keys(res).length > 0 ? res : undefined;
  }
  return obj;
};

export const MenusView = () => {
  const [storeId, setStoreId] = useState(
    "e269b9b3-e859-47b5-a9da-d82ce41139be",
  );
  const [fetchedMenu, setFetchedMenu] = useState<any>(null);
  const [itemId, setItemId] = useState("item-1");

  // Form State for Item Update
  const [itemFormData, setItemFormData] = useState<UpdateItemRequest>({
    price_info: { price: 1200 },
    tax_info: { vat_rate_percentage: 7 },
    nutritional_info: {
      calories: { lower_range: 850, upper_range: 850 },
      kilojoules: { lower_range: 3500, upper_range: 3500 },
    },
    dish_info: { classifications: [{ classification: "VEGETARIAN" }] },
    suspend_until: 0,
  });

  const [uploadMenuPayload, setUploadMenuPayload] = useState<any>(null);

  const cleanedFormData = cleanObject(itemFormData) || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Menus API
          </h1>
          <p className="text-textMuted mt-1">
            Retrieve and manage store menus.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-border">
          <label className="text-xs text-textMuted font-medium uppercase tracking-wider ml-1">
            Store ID
          </label>
          <input
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="bg-[#1e1e1e] border border-border text-white text-sm rounded px-3 py-1.5 w-72 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Get Menu */}
        <EndpointPanel
          title="Get Menu"
          description="Fetch the active menu for a specific store. The response is automatically parsed and rendered below."
          method="GET"
          displayEndpoint={`{{base_url}}/v2/eats/stores/${storeId}/menus`}
          endpoint={`/api/uber/stores/${storeId}/menus`}
          onExecute={() =>
            api.get(`/api/uber/stores/${storeId}/menus`).then((res) => {
              setFetchedMenu(res.data.data);
              return res.data;
            })
          }
        >
          <MenuRenderer menu={fetchedMenu} />
        </EndpointPanel>

        {/* 2. Update Menu Item (Now second) */}
        <EndpointPanel
          title="Update Menu Item"
          description="Build the request body using fields to update item metadata. The JSON editor and form are bidirectionally synced."
          method="POST"
          responseLayout="compact"
          requestLayout="row"
          displayEndpoint={`{{base_url}}/v2/eats/stores/${storeId}/menus/items/${itemId}`}
          endpoint={`/api/uber/stores/${storeId}/menus/items/${itemId}`}
          defaultBody={cleanedFormData}
          onBodyChange={(val) => {
            try {
              const parsed = JSON.parse(val);
              setItemFormData(parsed);
            } catch {
              // Ignore invalid JSON while typing
            }
          }}
          onExecute={(body) =>
            api
              .post(`/api/uber/stores/${storeId}/menus/items/${itemId}`, body)
              .then((res) => res.data)
          }
        >
          <div className="space-y-6">
            <div className="space-y-4 max-w-sm">
              <label className="text-xs font-bold text-textMuted uppercase flex items-center">
                Target Item ID{" "}
                <InfoTooltip content="Die ID des Artikels aus der Menu-Struktur." />
              </label>
              <input
                type="text"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full bg-surface border border-border p-2 rounded text-sm text-primary font-mono focus:outline-none focus:border-primary"
                placeholder="item-id"
              />
            </div>

            <ItemEditor data={itemFormData} onChange={setItemFormData} />
          </div>
        </EndpointPanel>

        {/* 3. Upload Menu (Now last) */}
        <EndpointPanel
          title="Upload Menu"
          description="Upload a new menu configuration for the store."
          method="PUT"
          requestLayout="col"
          displayEndpoint={`{{base_url}}/v2/eats/stores/${storeId}/menus`}
          endpoint={`/api/uber/stores/${storeId}/menus`}
          defaultBody={
            uploadMenuPayload || {
              menu_type: "MENU_TYPE_FULFILLMENT_DELIVERY",
              categories: [
                {
                  id: "category-1",
                  title: { translations: { en_us: "Burgers" } },
                  entities: [{ id: "item-1", type: "ITEM" }],
                },
              ],
              items: [
                {
                  id: "item-1",
                  title: { translations: { en_us: "Premium Smash Burger" } },
                  description: {
                    translations: { en_us: "Double patty, special sauce." },
                  },
                  price_info: { price: 1450 },
                  tax_info: { vat_rate_percentage: 7 },
                  image_url:
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200",
                },
              ],
              modifier_groups: [],
              service_availability: [
                {
                  day_of_week: "monday",
                  time_periods: [{ start_time: "09:00", end_time: "22:00" }],
                },
              ],
            }
          }
          onBodyChange={(val) => {
            try {
              setUploadMenuPayload(JSON.parse(val));
            } catch {
              // Ignore while typing
            }
          }}
          onExecute={(body) =>
            api
              .put(`/api/uber/stores/${storeId}/menus`, body)
              .then((res) => res.data)
          }
        >
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-200">
              <Trash2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Achtung: Destruktive Aktion</p>
                <p className="text-xs opacity-80 mt-1">
                  Das Hochladen eines fertigen Menüs überschreibt alle aktuellen
                  Kategorien und Artikel dieses Stores unwiderruflich.
                </p>
              </div>
            </div>

            <div className="bg-surface/30 border border-border p-5 rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">
                    Inline Artikel-Editor
                  </h3>
                  <p className="text-xs text-textMuted mt-1 max-w-lg">
                    Lade die aktuelle Menüstruktur aus dem Get Menu Request, um
                    Namen und Beschreibungen direkt hier anzupassen.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (fetchedMenu) {
                      const payload = { ...fetchedMenu };
                      // Fix null arrays that Uber Eats hates on Upload
                      if (!payload.modifier_groups)
                        payload.modifier_groups = [];
                      if (!payload.display_options)
                        payload.display_options = {};
                      if (!payload.menus) payload.menus = [];
                      setUploadMenuPayload(payload);
                    }
                  }}
                  disabled={!fetchedMenu}
                  className="bg-surfaceHover border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Daten aus Get Menu laden
                </button>
              </div>

              {!fetchedMenu && !uploadMenuPayload && (
                <div className="text-center py-6 text-sm text-textMuted/60 italic border-2 border-dashed border-border/50 rounded-lg">
                  Bitte führe zuerst den "Get Menu" Request (oben) aus.
                </div>
              )}

              {uploadMenuPayload?.items && (
                <div className="space-y-3 mt-6">
                  {uploadMenuPayload.items.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      className="bg-[#151515] border border-border/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 focus-within:border-primary/50 transition-colors"
                    >
                      <div className="w-32 break-words shrink-0">
                        <span className="text-[10px] font-mono text-orange-500 uppercase font-bold block opacity-70 mb-1">
                          Item ID
                        </span>
                        <span className="text-sm text-textMuted font-mono">
                          {item.id}
                        </span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <input
                            type="text"
                            value={item.title?.translations?.en_us || ""}
                            onChange={(e) => {
                              const newPayload = { ...uploadMenuPayload };
                              newPayload.items[idx].title = {
                                translations: { en_us: e.target.value },
                              };
                              setUploadMenuPayload(newPayload);
                            }}
                            className="bg-transparent border-b border-border/50 focus:border-primary w-full text-sm font-medium text-white px-1 py-1 focus:outline-none transition-colors"
                            placeholder="Artikelname"
                          />
                        </div>
                        <div>
                          <textarea
                            value={item.description?.translations?.en_us || ""}
                            onChange={(e) => {
                              const newPayload = { ...uploadMenuPayload };
                              newPayload.items[idx].description = {
                                translations: { en_us: e.target.value },
                              };
                              setUploadMenuPayload(newPayload);
                            }}
                            className="bg-transparent border-b border-border/50 focus:border-primary w-full text-xs text-textMuted px-1 py-1 focus:outline-none transition-colors resize-none h-12"
                            placeholder="Beschreibung"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.image_url || ""}
                            onChange={(e) => {
                              const newPayload = { ...uploadMenuPayload };
                              newPayload.items[idx].image_url = e.target.value;
                              setUploadMenuPayload(newPayload);
                            }}
                            className="bg-transparent border-b border-border/50 focus:border-primary w-full text-xs text-textMuted px-1 py-1 focus:outline-none transition-colors"
                            placeholder="Bild URL (https://...)"
                          />
                        </div>

                        {/* Sub-Editor for details */}
                        <details className="group border-t border-border/30 pt-3 mt-2">
                          <summary className="text-xs font-semibold text-textMuted cursor-pointer hover:text-white transition-colors flex items-center gap-1.5 outline-none">
                            <Settings className="w-3.5 h-3.5" />
                            Erweiterte Details bearbeiten (Preis, Steuern,
                            Allergene...)
                            <ChevronRight className="w-3.5 h-3.5 ml-auto group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="mt-4 pt-2 border-t border-border/30">
                            <ItemEditor
                              data={item}
                              onChange={(updatedItem) => {
                                const newPayload = { ...uploadMenuPayload };
                                newPayload.items[idx] = updatedItem;
                                setUploadMenuPayload(newPayload);
                              }}
                            />
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </EndpointPanel>
      </div>
    </div>
  );
};
