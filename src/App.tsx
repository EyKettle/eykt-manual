import "./App.css";
import "./styles/controls.scss";
import { Router } from "./router";
import FloatBar from "./controls/float-bar";

export default function App() {
	return (
		<Router>
			{(props) => (
				<main class="preview page content">
					{props.children}
					<FloatBar />
				</main>
			)}
		</Router>
	);
}
