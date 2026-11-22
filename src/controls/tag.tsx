import { Box } from "eykt-ui";
import { Component } from "solid-js";
import { tagFromId } from "../tags/config";

interface Props {
	id: number;
}
const Tag: Component<Props> = (props) => {
	return <Box class="tag">{tagFromId(props.id)}</Box>;
};
export default Tag;
