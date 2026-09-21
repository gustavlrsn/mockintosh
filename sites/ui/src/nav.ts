export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: readonly NavItem[];
}

export const HEADER_LINKS: readonly NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Docs", href: "/docs" },
  { title: "Components", href: "/components" },
  { title: "Examples", href: "/examples" },
];

export const DOC_ITEMS: readonly NavItem[] = [
  { title: "Introduction", href: "/docs" },
  { title: "Installation", href: "/docs/installation" },
  { title: "Styling", href: "/docs/styling" },
  { title: "Fills", href: "/docs/fills" },
  { title: "Fonts", href: "/docs/fonts" },
  { title: "Host elements", href: "/docs/host-elements" },
  { title: "Cursors", href: "/docs/cursors" },
];

export const COMPONENT_ITEMS: readonly NavItem[] = [
  { title: "Accordion", href: "/components/accordion" },
  { title: "Attachment", href: "/components/attachment" },
  { title: "Avatar", href: "/components/avatar" },
  { title: "Badge", href: "/components/badge" },
  { title: "Breadcrumb", href: "/components/breadcrumb" },
  { title: "Bubble", href: "/components/bubble" },
  { title: "Button", href: "/components/button" },
  { title: "Button Group", href: "/components/button-group" },
  { title: "Card", href: "/components/card" },
  { title: "Checkbox", href: "/components/checkbox" },
  { title: "Dialog", href: "/components/dialog" },
  { title: "Disclosure", href: "/components/disclosure" },
  { title: "Dithered", href: "/components/dithered" },
  { title: "Dither Transition", href: "/components/dither-transition" },
  { title: "Divider", href: "/components/divider" },
  { title: "Empty", href: "/components/empty" },
  { title: "Field", href: "/components/field" },
  { title: "Input Group", href: "/components/input-group" },
  { title: "Item", href: "/components/item" },
  { title: "Kbd", href: "/components/kbd" },
  { title: "Label", href: "/components/label" },
  { title: "Marker", href: "/components/marker" },
  { title: "Menu", href: "/components/menu" },
  { title: "Message", href: "/components/message" },
  { title: "Message Scroller", href: "/components/message-scroller" },
  { title: "Note", href: "/components/note" },
  { title: "Pagination", href: "/components/pagination" },
  { title: "Popover", href: "/components/popover" },
  { title: "Progress", href: "/components/progress" },
  { title: "Questionnaire", href: "/components/questionnaire" },
  { title: "Radio", href: "/components/radio" },
  { title: "ScrollView", href: "/components/scroll-view" },
  { title: "Select", href: "/components/select" },
  { title: "Slider", href: "/components/slider" },
  { title: "Spacer", href: "/components/spacer" },
  { title: "Spinner", href: "/components/spinner" },
  { title: "Switch", href: "/components/switch" },
  { title: "Table", href: "/components/table" },
  { title: "Tabs", href: "/components/tabs" },
  { title: "TextEditor", href: "/components/text-editor" },
  { title: "TextInput", href: "/components/text-input" },
  { title: "Toggle", href: "/components/toggle" },
  { title: "Tooltip", href: "/components/tooltip" },
];

export const SIDEBAR: readonly NavSection[] = [
  { title: "Docs", items: DOC_ITEMS },
  { title: "Components", items: COMPONENT_ITEMS },
];

export function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export type Route =
  | { kind: "home" }
  | { kind: "examples" }
  | { kind: "docs"; slug: string }
  | { kind: "components"; slug: string }
  | { kind: "notFound" };

export function matchRoute(path: string): Route {
  const p = normalizePath(path);
  if (p === "/") return { kind: "home" };
  if (p === "/examples") return { kind: "examples" };
  if (p === "/docs") return { kind: "docs", slug: "introduction" };
  if (p.startsWith("/docs/")) return { kind: "docs", slug: p.slice("/docs/".length) };
  if (p === "/components") return { kind: "components", slug: "overview" };
  if (p.startsWith("/components/")) {
    return { kind: "components", slug: p.slice("/components/".length) };
  }
  return { kind: "notFound" };
}

export function headerActive(path: string, href: string): boolean {
  const p = normalizePath(path);
  if (href === "/") return p === "/";
  return p === href || p.startsWith(`${href}/`);
}

export function pageTitle(path: string): string {
  const route = matchRoute(path);
  switch (route.kind) {
    case "home":
      return "mockintosh/ui";
    case "examples":
      return "Examples — mockintosh/ui";
    case "docs": {
      const item = DOC_ITEMS.find((d) => {
        const matched = matchRoute(d.href);
        return matched.kind === "docs" && matched.slug === route.slug;
      });
      return `${item?.title ?? "Docs"} — mockintosh/ui`;
    }
    case "components": {
      if (route.slug === "overview") return "Components — mockintosh/ui";
      const item = COMPONENT_ITEMS.find((c) => c.href === `/components/${route.slug}`);
      return `${item?.title ?? "Components"} — mockintosh/ui`;
    }
    default:
      return "Not found — mockintosh/ui";
  }
}
