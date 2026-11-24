import { t } from "#i18n";
import { Button } from "eykt-ui";
import { Component } from "solid-js";
import Tag from "../tag";

const ArticleCard: Component = () => {
	return (
		<Button class="card article">
			<h4>{t("about.title")}</h4>
			<label>{t("articles.desc")}</label>
			<div class="container column" style={{ gap: "var(--eykt-space-1)" }}>
				<Tag id={0} />
				<Tag id={1} />
			</div>
		</Button>
	);
};
export default ArticleCard;
