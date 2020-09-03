import { Provider as AuthProvider, useSession } from "next-auth/client";

import logMessageForHackers from "../lib/logMessageForHackers";
import "../styles/index.css";
import WithGraphQL from "lib/withGraphQL";

function MyApp({ Component, pageProps }) {
  //logMessageForHackers();

  const { session } = pageProps;

  return (
    <AuthProvider session={session}>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
