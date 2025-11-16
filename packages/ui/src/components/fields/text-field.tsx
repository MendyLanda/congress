import { Field, FieldError } from "../field";
import { Input } from "../input";
import { FloatingField } from "./floating-field";
import { useFieldContext } from "./form-context";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  className?: string;
  tabIndex?: number;
}

export function TextField({
  label,
  placeholder,
  type = "text",
  readOnly,
  className,
  tabIndex,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FloatingField label={label} htmlFor={field.name}>
        <Input
          id={field.name}
          type={type}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder ?? " "}
          readOnly={readOnly}
          className={className}
          tabIndex={tabIndex}
        />
      </FloatingField>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
