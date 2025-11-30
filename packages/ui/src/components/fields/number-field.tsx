import { Field, FieldError } from "../field";
import { Input } from "../input";
import { FloatingField } from "./floating-field";
import { useFieldContext } from "./form-context";

interface NumberFieldProps {
  label: string;
  min?: number;
  max?: number;
}

export function NumberField({ label, min, max }: NumberFieldProps) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FloatingField label={label}>
        <Input
          id={field.name}
          type="number"
          value={field.state.value}
          min={min}
          max={max}
          onBlur={field.handleBlur}
          onChange={(event) => {
            const nextValue = Number.isNaN(event.target.valueAsNumber)
              ? 0
              : event.target.valueAsNumber;
            field.handleChange(nextValue);
          }}
          placeholder={" "}
          inputMode="numeric"
        />
      </FloatingField>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
