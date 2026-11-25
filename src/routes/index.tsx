import { Title } from "@solidjs/meta";
import { t } from "#i18n";
import { Card } from "eykt-ui";
import { useNavigate } from "@solidjs/router";
import { paths } from "../router";
import Icon from "../components/icon";

export default function () {
	const navigate = useNavigate();
	return (
		<>
			<Title>{t("home.title")}</Title>
			<div class="page wide container focus">
				<h1>{t("home.title")}</h1>
				<label>{t("about.self")}</label>
				<div class="container column merge-card">
					<Card class="entrance articles" onCall={() => navigate(paths.articles)}>
						<h3 class="container column">
							<Icon id="article" />
							{t("articles")}
						</h3>
						<label>{t("articles.desc")}</label>
					</Card>
					<Card class="entrance moments">
						<h3 class="container column">
							<Icon id="cognition" />
							{t("moments")}
						</h3>
						<label>{t("moments.desc")}</label>
					</Card>
				</div>
			</div>
		</>
	);
}
