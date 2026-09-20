import type { JSX } from "@mockintosh/ui";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { Field } from "./Field";
import { Progress } from "./Progress";
import { RadioGroup, type RadioOption } from "./Radio";

export interface QuestionnaireChoice {
  value: string;
  label: string;
}

export interface QuestionnaireStep {
  name: string;
  prompt: string;
  description?: string;
  choices: readonly QuestionnaireChoice[];
  required?: boolean;
}

export interface QuestionnaireProps {
  items: readonly QuestionnaireStep[];
  index: number;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: () => void;
}

/** Multi-step agent prompt. Compose Radio + Field + Progress + Button. */
export function Questionnaire(props: QuestionnaireProps): JSX.Element {
  const count = () => Math.max(1, props.items.length);
  const index = () => Math.min(count() - 1, Math.max(0, props.index));
  const step = () => props.items[index()]!;
  const last = () => index() >= count() - 1;
  const blocked = () => step().required !== false && props.value.length === 0;

  const go = () => {
    if (blocked()) return;
    if (last()) props.onSubmit?.();
    else props.onNext();
  };

  const options = (): readonly RadioOption[] =>
    step().choices.map((c) => ({ value: c.value, label: c.label }));

  return (
    <box
      semantic={{ name: step().name, role: "form", value: props.value }}
      flexDirection="column"
      gap={10}
      alignSelf="stretch"
    >
      <Progress name="quiz-progress" value={index() + 1} max={count()} width={160} />
      <Field label={step().prompt} description={step().description}>
        <RadioGroup
          name={step().name}
          value={props.value}
          onChange={props.onChange}
          options={options()}
        />
      </Field>
      <ButtonGroup>
        <Button
          name="quiz-back"
          label="Back"
          disabled={index() === 0}
          onClick={props.onPrevious}
        />
        <Button
          name="quiz-next"
          label={last() ? "Done" : "Next"}
          disabled={blocked()}
          onClick={go}
        />
      </ButtonGroup>
    </box>
  );
}
