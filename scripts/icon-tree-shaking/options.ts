import type { ESTree } from "vite";
import { fail, findProperty, propertyName, type Source } from "./ast.ts";
import { FONT_FAMILY, variantOf, type Variant } from "./constants.ts";

export interface PluginOptions {
	readonly type: "manual" | "auto";
	/** Options this script does not own, kept as source text. */
	readonly otherProperties: string[];
	/** Non-Material targets, kept as source text. */
	readonly otherTargets: string[];
	/** Per-variant fields besides fontName and ligatures, kept as source text. */
	readonly materialExtras: Map<Variant, string[]>;
}

export interface MaterialTarget {
	readonly kind: "material";
	readonly variant: Variant;
	readonly extras: string[];
}

export interface OtherTarget {
	readonly kind: "other";
	/** Raw source of the target, kept as written. */
	readonly source: string;
}

export type TargetReading = MaterialTarget | OtherTarget;

export function readTarget(
	target: ESTree.ObjectExpression,
	source: Source,
	seenVariants: Set<Variant> = new Set(),
): TargetReading {
	const fontName = findProperty(target, "fontName");
	const value = fontName?.value;
	if (!value || value.type !== "Literal" || typeof value.value !== "string") {
		fail(source, target.start, "each fontExtractor target needs a literal `fontName`");
	}

	const variant = variantOf(value.value);
	if (!variant) {
		return { kind: "other", source: source.text.slice(target.start, target.end) };
	}
	if (seenVariants.has(variant)) {
		fail(source, target.start, `duplicate "${FONT_FAMILY[variant]}" target`);
	}
	seenVariants.add(variant);

	const extras: string[] = [];
	for (const property of target.properties) {
		if (property.type === "SpreadElement") {
			fail(
				source,
				property.start,
				"spread properties in a font target cannot be rewritten; list the options explicitly",
			);
		}
		const name = propertyName(property);
		if (name === "fontName" || name === "ligatures") continue;
		extras.push(source.text.slice(property.start, property.end));
	}
	return { kind: "material", variant, extras };
}

export function readTargets(value: ESTree.Expression, source: Source): TargetReading[] {
	let targets: ESTree.ObjectExpression[];
	if (value.type === "ObjectExpression") {
		targets = [value];
	} else if (value.type === "ArrayExpression") {
		targets = [];
		for (const element of value.elements) {
			if (element === null) continue;
			if (element.type !== "ObjectExpression") {
				fail(source, element.start, "each fontExtractor target must be an object literal");
			}
			targets.push(element);
		}
	} else {
		fail(source, value.start, "fontExtractor `targets` must be an object or array literal");
	}

	const seenVariants = new Set<Variant>();
	return targets.map((target) => readTarget(target, source, seenVariants));
}

export function readPluginOptions(object: ESTree.ObjectExpression, source: Source): PluginOptions {
	let type: PluginOptions["type"] = "manual";
	const otherProperties: string[] = [];
	const readings: TargetReading[] = [];

	for (const property of object.properties) {
		if (property.type === "SpreadElement") {
			fail(
				source,
				property.start,
				"spread properties in the fontExtractor options cannot be rewritten; list the options explicitly",
			);
		}
		const name = propertyName(property);
		if (name === "type") {
			const value = property.value;
			if (value.type !== "Literal" || (value.value !== "manual" && value.value !== "auto")) {
				fail(source, property.start, 'fontExtractor `type` must be "manual" or "auto"');
			}
			type = value.value;
		} else if (name === "targets") {
			readings.push(...readTargets(property.value, source));
		} else {
			otherProperties.push(source.text.slice(property.start, property.end));
		}
	}

	const otherTargets: string[] = [];
	const materialExtras = new Map<Variant, string[]>();
	for (const reading of readings) {
		if (reading.kind === "other") otherTargets.push(reading.source);
		else materialExtras.set(reading.variant, reading.extras);
	}
	return { type, otherProperties, otherTargets, materialExtras };
}
