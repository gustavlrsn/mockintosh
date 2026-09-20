import type { JSX } from "@mockintosh/ui";
import { NavLink, PageTitle } from "../layout";

export function MissingPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Not found" lede="That page is not in the catalog." />
      <NavLink href="/" label="Home" active={false} />
    </box>
  );
}
