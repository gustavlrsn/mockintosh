import "../styles/index.css";
import logMessageForHackers from "../lib/logMessageForHackers";

function MyApp({ Component, pageProps }) {
  //logMessageForHackers();

  return <Component {...pageProps} />;
}

export default MyApp;
