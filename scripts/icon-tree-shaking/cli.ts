// Keep Material Symbols limited to the <Icon> elements under src/.
//
// Runs as `pnpm icon:shake`; `pnpm build` calls it through `prebuild`.
// Dynamic ids and variants fail loudly: an unknowable glyph set cannot be tree-shaken.
// Only Material target ligatures and the per-variant CSS imports are owned here; other
// plugin options and targets are preserved.

import { resolve } from "node:path";
import { CONFIG_FILE, ICON_FILE, ICON_TAG, PLUGIN_PACKAGE } from "./constants.ts";
import { run } from "./index.ts";

function main(): void {
	const root = resolve(process.argv[2] ?? process.cwd());
	const result = run(root);
	if (!result) {
		console.log(
			`icon-tree-shaking: ${PLUGIN_PACKAGE} is not used in ${CONFIG_FILE} plugins — skipped`,
		);
		return;
	}

	console.log(
		`icon-tree-shaking: ${result.files} tsx files, ${result.icons} ${ICON_TAG} elements — ` +
			`${CONFIG_FILE} ${result.configChanged ? "updated" : "unchanged"}, ` +
			`${ICON_FILE} ${result.iconChanged ? "updated" : "unchanged"}`,
	);
}

try {
	main();
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`icon-tree-shaking: ${message}`);
	process.exitCode = 1;
}
