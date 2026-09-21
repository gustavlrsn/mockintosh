import { createContext, createSignal, onCleanup, useContext } from "@mockintosh/ui";
import type { JSX } from "@mockintosh/ui";
import { normalizePath } from "./nav";

export interface Router {
  path: () => string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<Router | null>(null);

export function useRouter(): Router {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter() must be called inside RouterProvider");
  return ctx;
}

export function RouterProvider(props: { children?: JSX.Element }): JSX.Element {
  const [path, setPath] = createSignal(normalizePath(window.location.pathname));

  const onPop = () => {
    setPath(normalizePath(window.location.pathname));
  };
  window.addEventListener("popstate", onPop);
  onCleanup(() => window.removeEventListener("popstate", onPop));

  const router: Router = {
    path,
    navigate(to: string) {
      const next = normalizePath(to);
      if (next === path()) return;
      history.pushState(null, "", next);
      setPath(next);
    },
  };

  return RouterContext({
    value: router,
    get children() {
      return props.children;
    },
  }) as unknown as JSX.Element;
}
