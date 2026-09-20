import { Show, createEffect } from "@mockintosh/ui";
import type { JSX } from "@mockintosh/ui";
import { DocsLayout, SiteHeader } from "./layout";
import { matchRoute, pageTitle } from "./nav";
import { COMPONENT_PAGES } from "./pages/components";
import { DOC_PAGES } from "./pages/docs";
import { ExamplesPage } from "./pages/examples";
import { HomePage } from "./pages/home";
import { MissingPage } from "./pages/missing";
import { Morph } from "./PageMorph";
import { RouterProvider, useRouter } from "./router";

export function App(): JSX.Element {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}

function Shell(): JSX.Element {
  const router = useRouter();
  const route = () => matchRoute(router.path());
  const docsChrome = () => {
    const kind = route().kind;
    return kind === "docs" || kind === "components";
  };

  createEffect(
    () => router.path(),
    (path) => {
      document.title = pageTitle(path);
    },
  );

  const page = (): JSX.Element => {
    const r = route();
    if (r.kind === "home") return <HomePage />;
    if (r.kind === "examples") return <ExamplesPage />;
    if (r.kind === "docs") {
      const Page = DOC_PAGES[r.slug] ?? MissingPage;
      return <Page />;
    }
    if (r.kind === "components") {
      const Page = COMPONENT_PAGES[r.slug] ?? MissingPage;
      return <Page />;
    }
    return <MissingPage />;
  };

  return (
    <box width="100%" height="100%" background={0} flexDirection="column">
      <SiteHeader />
      <Morph>
        <Show
          when={docsChrome()}
          fallback={
            <box width="100%" height="100%" overflow="scroll" scrollKey={router.path()} padding={24}>
              {page()}
            </box>
          }
        >
          <DocsLayout>{page()}</DocsLayout>
        </Show>
      </Morph>
    </box>
  );
}
