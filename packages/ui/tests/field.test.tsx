import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Field } from "../src/widgets/Field";
import { TextInput } from "../src/widgets/TextInput";

describe("Field", () => {
  it("shows the label and hides help when an error is set", () => {
    const ui = createUI({ screen: newBitMap(280, 80) });
    ui.render(() => (
      <Field label="Name" description="on the invoice" error="required">
        <TextInput name="name" width={160} value="" onChange={() => {}} />
      </Field>
    ));
    ui.frame();
    const texts = ui.inspect().filter((n) => n.role === "text").map((n) => n.text);
    expect(texts).toContain("Name");
    expect(texts).toContain("required");
    expect(texts).not.toContain("on the invoice");
  });
});
