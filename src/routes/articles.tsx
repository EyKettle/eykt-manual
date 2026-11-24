import { Title } from "@solidjs/meta";
import { t } from "#i18n";
import ArticleList from "../controls/article/list";

export default function () {
	return (
		<>
			<Title>{"Eykt - " + t("articles.title")}</Title>
			<h1>{t("articles.title")}</h1>
			<ArticleList />
		</>
	);
}
