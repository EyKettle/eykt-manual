import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { readConfig } from "./config.ts";
import { CONFIG_FILE, ICON_FILE } from "./constants.ts";
import { rewriteConfig } from "./rewrite-config.ts";
import { rewriteIconImports } from "./rewrite-icon-imports.ts";
import { collectIconUsage } from "./usage.ts";

export { findTsxFiles, readIconElement, staticString } from "./usage.ts";
export type { IconUsage, IconUse } from "./usage.ts";

export { configObjectOf, findPluginBindings, findPluginCall, isPluginCallee } from "./config.ts";
export type { ConfigCall, PluginBindings } from "./config.ts";

export { readPluginOptions, readTarget, readTargets } from "./options.ts";
export type { MaterialTarget, OtherTarget, PluginOptions, TargetReading } from "./options.ts";

export { planTargets, renderPluginOptions, renderTarget } from "./render.ts";
export type { TargetPlan } from "./render.ts";

export { ScriptError } from "./ast.ts";
export type { Source } from "./ast.ts";

export { FONT_FAMILY, STYLE_IMPORT, VARIANTS, isVariant, variantOf } from "./constants.ts";
export type { Variant } from "./constants.ts";

export { collectIconUsage, readConfig, rewriteConfig, rewriteIconImports };

export interface RunResult {
	readonly files: number;
	readonly icons: number;
	readonly configChanged: boolean;
	readonly iconChanged: boolean;
}

/** Returns null when the plugin is not configured in vite.config.ts. */
export function run(root: string): RunResult | null {
	const config = readConfig(root);
	if (!config) return null;

	const usage = collectIconUsage(root);
	const configText = rewriteConfig(config, usage);
	const iconText = rewriteIconImports(root, usage);
	if (configText !== null) writeFileSync(join(root, CONFIG_FILE), configText);
	if (iconText !== null) writeFileSync(join(root, ICON_FILE), iconText);

	return {
		files: usage.files,
		icons: usage.icons,
		configChanged: configText !== null,
		iconChanged: iconText !== null,
	};
}
