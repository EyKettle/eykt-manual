import { locale, setLocale } from "#i18n";
import { Button } from "eykt-ui";
import { Component, createMemo } from "solid-js";

const LocaleSwitch: Component = () => {
	const isChinese = createMemo(() => locale() === "zh-Hans");
	return (
		<div class="locale-switch">
			<div
				class="slider"
				style={{
					left: isChinese() ? "calc(50% + var(--eykt-space-1))" : "var(--eykt-space-2)",
					right: isChinese() ? "var(--eykt-space-2)" : "calc(50% + var(--eykt-space-1))",
				}}
			/>
			<Button disabled={!isChinese()} onCall={() => setLocale("en")} children="Eng" />
			<Button disabled={isChinese()} onCall={() => setLocale("zh-Hans")} children="中文" />
		</div>
	);
};
export default LocaleSwitch;
