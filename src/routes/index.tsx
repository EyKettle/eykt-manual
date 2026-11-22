import { Title } from "@solidjs/meta";
import { t } from "#i18n";
import ArticleList from "../controls/article/list";

export default function () {
	return (
		<>
			<Title>{t("title.home")}</Title>
			<ArticleList />
		</>
	);
}
