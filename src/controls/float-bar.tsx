import { Component } from "solid-js";
import LocaleSwitch from "./locale-switch";

interface Props {}
const FloatBar: Component<Props> = () => {
	return (
		<div
			class={{
				"float-bar": true,
			}}
		>
			<LocaleSwitch />
		</div>
	);
};
export default FloatBar;
