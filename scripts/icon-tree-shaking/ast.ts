import { parseSync, type ESTree } from "vite";

export class ScriptError extends Error {}

export interface Source {
	/** Display path used in error messages. */
	readonly file: string;
	readonly text: string;
}

export function fail(source: Source, offset: number, message: string): never {
	const before = source.text.slice(0, offset);
	const line = before.split("\n").length;
	const column = offset - before.lastIndexOf("\n");
	throw new ScriptError(`${source.file}:${line}:${column}: ${message}`);
}

export function parse(source: Source): ESTree.Program {
	const result = parseSync(source.file, source.text);
	const [error] = result.errors;
	if (error) {
		const at = error.labels[0]?.start ?? 0;
		fail(source, at, `syntax error: ${error.message}`);
	}
	return result.program;
}

export function isAstNode(value: unknown): value is ESTree.Node {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as { type?: unknown }).type === "string"
	);
}

/** Skips `parent` so the walk cannot go back up the tree. */
export function walk(node: unknown, onNode: (node: ESTree.Node) => void): void {
	if (Array.isArray(node)) {
		for (const child of node) walk(child, onNode);
		return;
	}
	if (!isAstNode(node)) return;
	onNode(node);
	for (const [key, value] of Object.entries(node as unknown as Record<string, unknown>)) {
		if (key === "type" || key === "start" || key === "end" || key === "parent") continue;
		walk(value, onNode);
	}
}

export function propertyName(property: ESTree.ObjectProperty): string | undefined {
	if (property.computed) return undefined;
	const key = property.key;
	if (key.type === "Identifier") return key.name;
	if (key.type === "Literal" && typeof key.value === "string") return key.value;
	return undefined;
}

export function findProperty(
	object: ESTree.ObjectExpression,
	name: string,
): ESTree.ObjectProperty | undefined {
	return object.properties.find(
		(property): property is ESTree.ObjectProperty =>
			property.type === "Property" && propertyName(property) === name,
	);
}
