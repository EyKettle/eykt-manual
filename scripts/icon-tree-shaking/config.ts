import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ESTree } from "vite";
import { fail, findProperty, parse, ScriptError, type Source } from "./ast.ts";
import { CONFIG_FILE, PLUGIN_PACKAGE } from "./constants.ts";

export interface PluginBindings {
	readonly functionNames: Set<string>;
	readonly namespaceNames: Set<string>;
}

export interface ConfigCall {
	readonly source: Source;
	readonly call: ESTree.CallExpression;
}

export function findPluginBindings(program: ESTree.Program): PluginBindings {
	const functionNames = new Set<string>();
	const namespaceNames = new Set<string>();

	for (const statement of program.body) {
		if (statement.type !== "ImportDeclaration" || statement.source.value !== PLUGIN_PACKAGE)
			continue;
		if (statement.importKind === "type") continue;

		for (const specifier of statement.specifiers) {
			if (specifier.type === "ImportDefaultSpecifier") {
				functionNames.add(specifier.local.name);
			} else if (specifier.type === "ImportNamespaceSpecifier") {
				namespaceNames.add(specifier.local.name);
			} else if (specifier.importKind !== "type") {
				const imported =
					specifier.imported.type === "Identifier"
						? specifier.imported.name
						: specifier.imported.value;
				if (imported === "FontExtractor" || imported === "default") {
					functionNames.add(specifier.local.name);
				}
			}
		}
	}

	return { functionNames, namespaceNames };
}

function objectFromFunctionBody(
	body: ESTree.FunctionBody | ESTree.Expression | null,
): ESTree.ObjectExpression | undefined {
	if (body === null) return undefined;
	if (body.type !== "BlockStatement") return objectExpressionOf(body);
	for (const statement of body.body) {
		if (statement.type !== "ReturnStatement" || !statement.argument) continue;
		const object = objectExpressionOf(statement.argument);
		if (object) return object;
	}
	return undefined;
}

function objectExpressionOf(node: ESTree.Node): ESTree.ObjectExpression | undefined {
	switch (node.type) {
		case "ObjectExpression":
			return node;
		case "CallExpression": {
			if (node.callee.type !== "Identifier" || node.callee.name !== "defineConfig")
				return undefined;
			const argument = node.arguments[0];
			return argument && argument.type !== "SpreadElement"
				? objectExpressionOf(argument)
				: undefined;
		}
		case "ArrowFunctionExpression":
		case "FunctionExpression":
			return objectFromFunctionBody(node.body);
		case "ParenthesizedExpression":
		case "TSAsExpression":
		case "TSSatisfiesExpression":
		case "TSNonNullExpression":
			return objectExpressionOf(node.expression);
		default:
			return undefined;
	}
}

export function configObjectOf(program: ESTree.Program): ESTree.ObjectExpression | undefined {
	const exported = program.body.find(
		(statement): statement is ESTree.ExportDefaultDeclaration =>
			statement.type === "ExportDefaultDeclaration",
	);
	return exported ? objectExpressionOf(exported.declaration) : undefined;
}

export function isPluginCallee(callee: ESTree.Expression, bindings: PluginBindings): boolean {
	if (callee.type === "Identifier") return bindings.functionNames.has(callee.name);
	if (callee.type !== "MemberExpression" || callee.computed) return false;
	if (callee.object.type !== "Identifier" || callee.property.type !== "Identifier") return false;
	if (!bindings.namespaceNames.has(callee.object.name)) return false;
	return callee.property.name === "FontExtractor" || callee.property.name === "default";
}

export function findPluginCall(
	config: ESTree.ObjectExpression,
	bindings: PluginBindings,
	source: Source,
): ESTree.CallExpression | null {
	const plugins = findProperty(config, "plugins");
	if (!plugins) return null;
	if (plugins.value.type !== "ArrayExpression") {
		fail(source, plugins.start, "`plugins` must be an array literal to be inspected");
	}

	const calls = plugins.value.elements.filter(
		(element): element is ESTree.CallExpression =>
			element?.type === "CallExpression" && isPluginCallee(element.callee, bindings),
	);
	if (calls.length === 0) return null;
	if (calls.length > 1) {
		fail(source, calls[1].start, `more than one ${PLUGIN_PACKAGE} call in \`plugins\`; leave one`);
	}
	return calls[0];
}

export function readConfig(root: string): ConfigCall | null {
	const file = join(root, CONFIG_FILE);
	if (!existsSync(file)) {
		throw new ScriptError(`no ${CONFIG_FILE} at ${root}`);
	}
	const source: Source = { file: CONFIG_FILE, text: readFileSync(file, "utf8") };
	const program = parse(source);
	const bindings = findPluginBindings(program);
	if (bindings.functionNames.size === 0 && bindings.namespaceNames.size === 0) return null;

	const config = configObjectOf(program);
	if (!config) {
		fail(source, 0, "cannot locate the object passed to defineConfig");
	}
	const call = findPluginCall(config, bindings, source);
	return call ? { source, call } : null;
}
