import { t } from "#i18n";
import { Button } from "eykt-ui";
import { Component } from "solid-js";
import Tag from "../tag";

const ArticleCard: Component = () => {
	return (
		<Button class="article-card">
			<h4>{t("title.about")}</h4>
			<label>{t("demo.empty")}</label>
			<div class="container column" style={{ gap: "var(--eykt-space-1)" }}>
				<Tag id={0} />
				<Tag id={1} />
			</div>
		</Button>
	);
};
export default ArticleCard;
