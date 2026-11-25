export function reindent(snippet: string, indent: string): string {
	const lines = snippet.split("\n");
	if (lines.length === 1) return indent + lines[0];
	const widths = lines
		.slice(1)
		.filter((line) => line.trim().length > 0)
		.map((line) => line.length - line.trimStart().length);
	const cut = widths.length > 0 ? Math.min(...widths) : 0;
	return lines
		.map((line, index) => {
			if (index === 0) return indent + line;
			if (line.trim().length === 0) return "";
			return indent + line.slice(cut);
		})
		.join("\n");
}

export function lineIndent(text: string, offset: number): string {
	const start = text.lastIndexOf("\n", offset - 1) + 1;
	return /^[\t ]*/.exec(text.slice(start, offset))?.[0] ?? "";
}

export function lineStart(text: string, offset: number): number {
	return text.lastIndexOf("\n", offset - 1) + 1;
}

export function lineEnd(text: string, offset: number): number {
	const newline = text.indexOf("\n", offset);
	return newline === -1 ? text.length : newline + 1;
}
