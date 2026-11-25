import { FONT_FAMILY, MAX_LINE_WIDTH, VARIANTS, type Variant } from "./constants.ts";
import type { PluginOptions } from "./options.ts";
import { reindent } from "./text.ts";

export interface TargetPlan {
	readonly variant: Variant;
	readonly ligatures: string[];
	readonly extras: string[];
}

export function planTargets(
	ids: Map<Variant, Set<string>>,
	materialExtras: Map<Variant, string[]>,
): TargetPlan[] {
	const plans: TargetPlan[] = [];
	for (const variant of VARIANTS) {
		const used = ids.get(variant);
		if (!used || used.size === 0) continue;
		plans.push({
			variant,
			ligatures: [...used].sort(),
			extras: materialExtras.get(variant) ?? [],
		});
	}
	return plans;
}

export function renderTarget(plan: TargetPlan, indent: string): string {
	const fieldIndent = `${indent}\t`;
	const ligatureIndent = `${fieldIndent}\t`;
	const lines = [
		`${indent}{`,
		`${fieldIndent}fontName: ${JSON.stringify(FONT_FAMILY[plan.variant])},`,
	];

	const oneLine = `${fieldIndent}ligatures: [${plan.ligatures.map((id) => JSON.stringify(id)).join(", ")}],`;
	if (oneLine.length <= MAX_LINE_WIDTH) {
		lines.push(oneLine);
	} else {
		lines.push(`${fieldIndent}ligatures: [`);
		for (const id of plan.ligatures) lines.push(`${ligatureIndent}${JSON.stringify(id)},`);
		lines.push(`${fieldIndent}],`);
	}

	for (const extra of plan.extras) lines.push(`${reindent(extra, fieldIndent)},`);
	lines.push(`${indent}},`);
	return lines.join("\n");
}

export function renderPluginOptions(
	options: PluginOptions,
	ids: Map<Variant, Set<string>>,
	indent: string,
): string {
	const inner = `${indent}\t`;
	const targetIndent = `${inner}\t`;
	const targets = planTargets(ids, options.materialExtras).map((plan) =>
		renderTarget(plan, targetIndent),
	);
	for (const target of options.otherTargets) {
		targets.push(`${reindent(target, targetIndent)},`);
	}

	const lines: string[] = ["{", `${inner}type: ${JSON.stringify(options.type)},`];
	if (targets.length === 0) {
		lines.push(`${inner}targets: [],`);
	} else {
		lines.push(`${inner}targets: [`, ...targets, `${inner}],`);
	}
	for (const property of options.otherProperties) {
		lines.push(`${reindent(property, inner)},`);
	}
	lines.push(`${indent}}`);
	return lines.join("\n");
}
