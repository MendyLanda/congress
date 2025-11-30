import { useStore } from "@tanstack/react-form";

import { DatePicker } from "../date-picker";
import { Field, FieldError } from "../field";
import { FloatingField } from "./floating-field";
import { useFieldContext, useFormContext } from "./form-context";

interface DatePickerFieldProps {
  label: string;
}

export function DatePickerField({ label }: DatePickerFieldProps) {
  const field = useFieldContext<string | undefined>();
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FloatingField label={label} filled={!!field.state.value}>
        <DatePicker
          id={field.name}
          value={field.state.value ?? undefined}
          onChange={(date) => field.handleChange(date)}
          disabled={isSubmitting}
          placeholder={" "}
          className="w-full"
        />
      </FloatingField>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
