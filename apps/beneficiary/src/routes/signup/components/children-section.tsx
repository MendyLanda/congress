import type { UseFormReturn } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import { FieldGroup } from "@congress/ui/field";
import {
  ChildrenFieldsGroup,
  type useAppForm,
} from "@congress/ui/fields";

type Form = UseFormReturn<
  ReturnType<typeof useAppForm>["defaultValues"],
  unknown
>;

interface ChildrenSectionProps {
  form: Form;
}

export function ChildrenSection({ form }: ChildrenSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">{t("children_information")}</h2>
      <FieldGroup>
        <form.AppField
          name="childrenCount"
          listeners={{
            onChange: ({ value, fieldApi }) => {
              const currentChildren =
                fieldApi.form.getFieldValue("children");
              const targetCount = value;
              const lastName = fieldApi.form.getFieldValue("lastName");

              if (currentChildren.length < targetCount) {
                // Add new children
                const diff = targetCount - currentChildren.length;
                const newChildren = [...currentChildren];
                for (let i = 0; i < diff; i++) {
                  newChildren.push({
                    firstName: "",
                    lastName,
                    nationalId: "",
                    dateOfBirth: "",
                  });
                }
                fieldApi.form.setFieldValue("children", newChildren);
              } else if (currentChildren.length > targetCount) {
                // Remove excess children
                fieldApi.form.setFieldValue(
                  "children",
                  currentChildren.slice(0, targetCount),
                );
              }
            },
          }}
        >
          {(field) => (
            <field.NumberField
              label={t("number_of_children")}
              min={0}
              max={20}
            />
          )}
        </form.AppField>
      </FieldGroup>
      <form.AppField name="children" mode="array">
        {(field) => (
          <form.Subscribe
            selector={(state) => state.values.childrenCount}
            children={(childrenCount) => {
              const count =
                typeof childrenCount === "number" ? childrenCount : 0;
              return (
                <div className="space-y-4">
                  {field.state.value.map((_, index) => (
                    <ChildrenFieldsGroup
                      key={index}
                      form={form}
                      fields={`children[${index}]`}
                      childNumber={index + 1}
                    />
                  ))}
                  {count > 0 &&
                    field.state.value.length !== count && (
                      <p className="text-destructive text-sm">
                        {t("children_mismatch_hint")}
                      </p>
                    )}
                </div>
              );
            }}
          />
        )}
      </form.AppField>
    </section>
  );
}

