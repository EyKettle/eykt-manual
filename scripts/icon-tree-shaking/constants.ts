export const PLUGIN_PACKAGE = "vite-font-extractor-plugin";
export const CONFIG_FILE = "vite.config.ts";
export const ICON_FILE = "src/components/icon.tsx";
export const SRC_DIR = "src";

export const ICON_TAG = "Icon";
export const VARIANT_ATTR = "variant";
export const ID_ATTR = "id";

export const VARIANTS = ["outlined", "rounded", "sharp"] as const;
export type Variant = (typeof VARIANTS)[number];

export function isVariant(value: string): value is Variant {
	return (VARIANTS as readonly string[]).includes(value);
}

// Families declared by material-symbols/<variant>.css.
export const FONT_FAMILY: Record<Variant, string> = {
	outlined: "Material Symbols Outlined",
	rounded: "Material Symbols Rounded",
	sharp: "Material Symbols Sharp",
};

export function variantOf(fontName: string): Variant | undefined {
	return VARIANTS.find((variant) => FONT_FAMILY[variant] === fontName);
}

export const STYLE_IMPORT: Record<Variant, string> = {
	outlined: "material-symbols/outlined.css",
	rounded: "material-symbols/rounded.css",
	sharp: "material-symbols/sharp.css",
};

// index.css loads all three variants, so the per-variant imports replace it too.
export const MANAGED_IMPORT = /^material-symbols\/(outlined|rounded|sharp|index)\.css$/;

export const MAX_LINE_WIDTH = 100;
