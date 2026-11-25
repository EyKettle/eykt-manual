import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import type { ESTree } from "vite";
import { fail, parse, ScriptError, walk, type Source } from "./ast.ts";
import {
	ICON_TAG,
	ID_ATTR,
	SRC_DIR,
	VARIANT_ATTR,
	VARIANTS,
	isVariant,
	type Variant,
} from "./constants.ts";

export interface IconUsage {
	/** Icon ids grouped by the variant that renders them. */
	readonly ids: Map<Variant, Set<string>>;
	readonly files: number;
	readonly icons: number;
}

export interface IconUse {
	readonly id: string;
	readonly variant: Variant;
}

export function staticString(value: ESTree.JSXAttributeValue | null): string | undefined {
	if (!value) return undefined;
	if (value.type === "Literal") {
		return typeof value.value === "string" ? value.value : undefined;
	}
	if (value.type === "JSXExpressionContainer") {
		const expression = value.expression;
		if (expression.type === "Literal" && typeof expression.value === "string") {
			return expression.value;
		}
		if (expression.type === "TemplateLiteral" && expression.expressions.length === 0) {
			return expression.quasis[0]?.value.cooked ?? undefined;
		}
	}
	return undefined;
}

export function readIconElement(source: Source, opening: ESTree.JSXOpeningElement): IconUse | null {
	if (opening.name.type !== "JSXIdentifier" || opening.name.name !== ICON_TAG) return null;

	let id: string | undefined;
	let variant: Variant = "outlined";

	for (const attribute of opening.attributes) {
		if (attribute.type === "JSXSpreadAttribute") {
			fail(
				source,
				attribute.start,
				`<${ICON_TAG}> has a spread attribute; its ${ID_ATTR} and ${VARIANT_ATTR} cannot be read statically`,
			);
		}
		if (attribute.name.type !== "JSXIdentifier") continue;

		if (attribute.name.name === ID_ATTR) {
			const value = staticString(attribute.value);
			if (value === undefined) {
				fail(
					source,
					attribute.start,
					`<${ICON_TAG} ${ID_ATTR}> must be a string literal so the glyph can be tree-shaken`,
				);
			}
			id = value;
		} else if (attribute.name.name === VARIANT_ATTR) {
			const value = staticString(attribute.value);
			if (value === undefined) {
				fail(
					source,
					attribute.start,
					`<${ICON_TAG} ${VARIANT_ATTR}> must be a string literal so the font can be tree-shaken`,
				);
			}
			if (!isVariant(value)) {
				fail(
					source,
					attribute.start,
					`unknown ${VARIANT_ATTR} "${value}"; expected ${VARIANTS.join(", ")}`,
				);
			}
			variant = value;
		}
	}

	if (id === undefined) {
		fail(source, opening.start, `<${ICON_TAG}> is missing the ${ID_ATTR} attribute`);
	}
	return { id, variant };
}

export function findTsxFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...findTsxFiles(path));
		else if (entry.isFile() && entry.name.endsWith(".tsx")) files.push(path);
	}
	return files.sort();
}

export function collectIconUsage(root: string): IconUsage {
	const srcDir = join(root, SRC_DIR);
	if (!existsSync(srcDir)) {
		throw new ScriptError(`no ${SRC_DIR}/ directory at ${root}`);
	}

	const files = findTsxFiles(srcDir);
	const ids = new Map<Variant, Set<string>>(
		VARIANTS.map((variant) => [variant, new Set<string>()]),
	);
	let icons = 0;

	for (const file of files) {
		const source: Source = {
			file: relative(root, file),
			text: readFileSync(file, "utf8"),
		};
		const program = parse(source);

		walk(program, (node) => {
			if (node.type !== "JSXElement") return;
			const use = readIconElement(source, node.openingElement);
			if (!use) return;
			icons += 1;
			ids.get(use.variant)?.add(use.id);
		});
	}

	return { ids, files: files.length, icons };
}
