import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ESTree } from "vite";
import { parse, ScriptError, type Source } from "./ast.ts";
import { ICON_FILE, MANAGED_IMPORT, STYLE_IMPORT, VARIANTS } from "./constants.ts";
import { lineEnd, lineStart } from "./text.ts";
import type { IconUsage } from "./usage.ts";

/** Returns null when the file is already current. */
export function rewriteIconImports(root: string, usage: IconUsage): string | null {
	const file = join(root, ICON_FILE);
	if (!existsSync(file)) {
		throw new ScriptError(`no ${ICON_FILE} at ${root}`);
	}
	const source: Source = { file: ICON_FILE, text: readFileSync(file, "utf8") };
	const text = source.text;
	const program = parse(source);

	const managed = program.body.filter(
		(statement): statement is ESTree.ImportDeclaration =>
			statement.type === "ImportDeclaration" && MANAGED_IMPORT.test(statement.source.value),
	);
	const desired = VARIANTS.filter((variant) => (usage.ids.get(variant)?.size ?? 0) > 0)
		.map((variant) => `import "${STYLE_IMPORT[variant]}";\n`)
		.join("");

	let updated: string;
	if (managed.length > 0) {
		const at = lineStart(text, managed[0].start);
		let cleaned = "";
		let cursor = 0;
		for (const statement of managed) {
			cleaned += text.slice(cursor, lineStart(text, statement.start));
			cursor = lineEnd(text, statement.end);
		}
		cleaned += text.slice(cursor);
		updated = cleaned.slice(0, at) + desired + cleaned.slice(at);
	} else if (desired === "") {
		return null;
	} else {
		const firstImport = program.body.find((statement) => statement.type === "ImportDeclaration");
		const at = firstImport ? lineStart(text, firstImport.start) : 0;
		updated = text.slice(0, at) + desired + text.slice(at);
	}

	return updated === text ? null : updated;
}
