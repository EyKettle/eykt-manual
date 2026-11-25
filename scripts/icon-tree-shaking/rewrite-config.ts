import { fail } from "./ast.ts";
import type { ConfigCall } from "./config.ts";
import { readPluginOptions, type PluginOptions } from "./options.ts";
import { renderPluginOptions } from "./render.ts";
import { lineIndent } from "./text.ts";
import type { IconUsage } from "./usage.ts";

/** Returns null when the file is already current. */
export function rewriteConfig(config: ConfigCall, usage: IconUsage): string | null {
	const { source, call } = config;
	const text = source.text;
	const indent = lineIndent(text, call.callee.start);

	let start: number;
	let end: number;
	let replacement: string;

	if (call.arguments.length === 0) {
		const empty: PluginOptions = {
			type: "manual",
			otherProperties: [],
			otherTargets: [],
			materialExtras: new Map(),
		};
		start = call.typeArguments?.end ?? call.callee.end;
		end = call.end;
		replacement = `(${renderPluginOptions(empty, usage.ids, indent)})`;
	} else {
		const argument = call.arguments[0];
		if (!argument) fail(source, call.start, "fontExtractor expects one options argument");
		if (call.arguments.length > 1) {
			fail(source, call.start, "fontExtractor expects one options argument");
		}
		if (argument.type !== "ObjectExpression") {
			fail(
				source,
				argument.start,
				"fontExtractor options must be an object literal so unrelated settings can be preserved",
			);
		}
		start = argument.start;
		end = argument.end;
		replacement = renderPluginOptions(readPluginOptions(argument, source), usage.ids, indent);
	}

	const updated = text.slice(0, start) + replacement + text.slice(end);
	return updated === text ? null : updated;
}
