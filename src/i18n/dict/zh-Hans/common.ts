import type { DictionaryOf } from "../../types";

export default {
	"empty.here": "这里没什么东西",
	back: "返回",
	home: "主页",
	"home.title": "电水壶的说明书",
	about: "关于",
	"about.title": "关于这个站点",
	"about.self": "一个用来烧水的电子设备",
	articles: "文章",
	"articles.title": "文章列表",
	"articles.desc": "看看我写了什么",
	moments: "动态",
	"moments.desc": "了解我在想什么",
} as const satisfies DictionaryOf<"common">;
