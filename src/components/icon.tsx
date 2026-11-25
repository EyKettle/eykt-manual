import "material-symbols/outlined.css";
import { Component, createMemo } from "solid-js";

interface Props {
	variant?: "outlined" | "rounded" | "sharp";
	id: string;
}
const Icon: Component<Props> = (props) => {
	const style = createMemo(() => `material-symbols-${props.variant ?? "outlined"}`);
	return <span class={[style(), "icon"]} data-icon={props.id} />;
};

export default Icon;
