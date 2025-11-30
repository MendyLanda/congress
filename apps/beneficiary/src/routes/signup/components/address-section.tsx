import type { UseFormReturn } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import type { useAppForm } from "@congress/ui/fields";
import { FieldGroup } from "@congress/ui/field";
import { AddressFieldsGroup } from "@congress/ui/fields";

type Form = UseFormReturn<
  ReturnType<typeof useAppForm>["defaultValues"],
  unknown
>;

interface AddressSectionProps {
  form: Form;
}

export function AddressSection({ form }: AddressSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <FieldGroup>
        <form.AppForm>
          <AddressFieldsGroup
            form={form}
            fields={{
              cityId: "address.cityId",
              streetId: "address.streetId",
              houseNumber: "address.houseNumber",
              addressLine2: "address.addressLine2",
              postalCode: "address.postalCode",
            }}
            title={t("address_information")}
          />
        </form.AppForm>
      </FieldGroup>
    </section>
  );
}
