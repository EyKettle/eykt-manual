const tags = ["demo", "system"] as const;

export function tagFromId(id: number) {
	return tags[id];
}
