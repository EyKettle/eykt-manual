import { Component, For } from "solid-js";
import ArticleCard from "./card";

const ArticleList: Component = () => {
	return (
		<div class="page wide container">
			<For each={[1, 2, 3]}>{() => <ArticleCard />}</For>
		</div>
	);
};
export default ArticleList;
