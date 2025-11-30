import type { InputProps } from "../input";
import { Field, FieldError } from "../field";
import { Input } from "../input";
import { FloatingField } from "./floating-field";
import { useFieldContext } from "./form-context";

interface TextFieldProps extends InputProps {
  label: string;

  /**
   * The label is the placeholder, and is floated when the input is not empty, or when the input is focused.
   */
  placeholder?: never;

  /**
   * display error message below the field
   * @default true
   */
  displayError?: boolean;
}

export function TextField({
  label,
  type = "text",
  variant,
  align,
  displayError = true,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FloatingField label={label} variant={variant} align={align}>
        <Input
          id={field.name}
          type={type}
          value={field.state.value}
          onBlur={field.handleBlur}
          placeholder={" "}
          variant={variant}
          align={align}
          onChange={(event) => field.handleChange(event.target.value)}
          {...props}
        />
      </FloatingField>
      {displayError && isInvalid && (
        <FieldError errors={field.state.meta.errors} variant={variant} />
      )}
    </Field>
  );
}
