import { Box, Button } from "eykt-ui";
import { t } from "#i18n";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";

export default function () {
	const navigate = useNavigate();

	return (
		<Box class="page wide">
			<Title>{t("about.title")}</Title>
			<Button onCall={() => navigate(-1)}>{t("back")}</Button>
			<div class="container column">
				<label>{t("empty.here")}</label>
			</div>
		</Box>
	);
}
