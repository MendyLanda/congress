import type { AnyFieldApi } from "@tanstack/react-form";
import type { z } from "zod/v4";
import { useEffect, useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import type { maritalStatusSchema } from "@congress/validators";
import { Button } from "@congress/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@congress/ui/field";
import { Input } from "@congress/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@congress/ui/select";
import { toast } from "@congress/ui/toast";
import {
  beneficiaryDocumentSchema,
  beneficiarySignupSchema,
} from "@congress/validators";

import { AddressFields } from "~/component/address-fields";
import { useBeneficiaryAuth } from "~/lib/beneficiary-auth-provider";
import { useTRPC } from "~/lib/trpc";

type SignupDocument = z.infer<typeof beneficiaryDocumentSchema>;
type MaritalStatus = z.infer<typeof maritalStatusSchema>;

type DocumentsRequirement = "required" | "optional" | "hidden";

const MAX_DOCUMENTS = 3;
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    nationalId:
      typeof search.nationalId === "string" ? search.nationalId : undefined,
  }),
  component: SignupRouteComponent,
});

function SignupRouteComponent() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { session } = useBeneficiaryAuth();
  const search = Route.useSearch();

  useEffect(() => {
    if (session) {
      void navigate({ to: "/", replace: true });
    }
  }, [navigate, session]);

  const signupMutation = useMutation(
    trpc.beneficiaryAuth.signup.mutationOptions({
      onSuccess: async (data) => {
        toast.success(data.message);
        await navigate({ to: "/", replace: true });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      nationalId: search.nationalId ?? "",
      firstName: "",
      lastName: "",
      personalPhoneNumber: "",
      homePhoneNumber: "",
      dateOfBirth: "",
      maritalStatus: "single" as MaritalStatus,
      address: {
        cityId: 0,
        cityCode: 0,
        streetId: 0,
        houseNumber: "",
        addressLine2: "",
        postalCode: "",
      },
      spouse: undefined as
        | {
            nationalId: string;
            firstName: string;
            lastName: string;
            phoneNumber?: string;
            dateOfBirth: string;
          }
        | undefined,
      childrenCount: 0,
      children: [] as {
        firstName: string;
        lastName: string;
        nationalId: string;
        dateOfBirth: string;
      }[],
      documents: [] as SignupDocument[],
    },
    validators: {
      onSubmit: beneficiarySignupSchema,
    },
    onSubmit: async ({ value }) => {
      const { cityCode: _cityCode, ...address } = value.address;
      const payload = {
        ...value,
        address,
        homePhoneNumber: value.homePhoneNumber || undefined,
        spouse:
          value.maritalStatus === "single"
            ? undefined
            : value.spouse
              ? {
                  ...value.spouse,
                  phoneNumber: value.spouse.phoneNumber || undefined,
                }
              : undefined,
        children: value.children.slice(0, value.childrenCount),
      };

      await signupMutation.mutateAsync(payload);
    },
  });

  const documents = useStore(form.store, (state) => state.values.documents);
  const children = useStore(form.store, (state) => state.values.children);
  const childrenCount = useStore(
    form.store,
    (state) => state.values.childrenCount,
  );
  const lastName = useStore(form.store, (state) => state.values.lastName);
  const dateOfBirth = useStore(form.store, (state) => state.values.dateOfBirth);
  const maritalStatus = useStore(
    form.store,
    (state) => state.values.maritalStatus,
  );
  const spouse = useStore(form.store, (state) => state.values.spouse);

  useEffect(() => {
    if (maritalStatus === "single" && spouse) {
      form.setFieldValue("spouse", undefined);
    } else if (maritalStatus !== "single" && !spouse) {
      form.setFieldValue("spouse", {
        nationalId: "",
        firstName: "",
        lastName,
        phoneNumber: "",
        dateOfBirth: "",
      });
    }
  }, [form, maritalStatus, spouse, lastName]);

  useEffect(() => {
    if (children.length < childrenCount) {
      const diff = childrenCount - children.length;
      const nextChildren = [...children];
      for (let index = 0; index < diff; index++) {
        nextChildren.push({
          firstName: "",
          lastName,
          nationalId: "",
          dateOfBirth: "",
        });
      }
      form.setFieldValue("children", nextChildren);
    } else if (children.length > childrenCount) {
      form.setFieldValue("children", children.slice(0, childrenCount));
    }
  }, [children, childrenCount, form, lastName]);

  useEffect(() => {
    if (!children.length) return;
    form.setFieldValue(
      "children",
      children.map((child) => ({
        ...child,
        lastName,
      })),
    );
  }, [children, form, lastName]);

  const documentsRequirement = useMemo<DocumentsRequirement>(() => {
    if (!dateOfBirth) return "required";
    const age = calculateAge(dateOfBirth);
    if (Number.isNaN(age)) return "required";
    if (age >= 18) return "required";
    if (age >= 16) return "optional";
    return "hidden";
  }, [dateOfBirth]);

  useEffect(() => {
    if (documentsRequirement === "hidden" && documents.length > 0) {
      form.setFieldValue("documents", []);
    }
  }, [documents.length, documentsRequirement, form]);

  const [canSubmit, isSubmitting] = useStore(form.store, (state) => [
    state.canSubmit,
    state.isSubmitting,
  ]);

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (documents.length + fileList.length > MAX_DOCUMENTS) {
      toast.error(t("too_many_documents"));
      return;
    }

    const nextDocuments: SignupDocument[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        toast.error(t("file_too_large"));
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        beneficiaryDocumentSchema.parse({
          type: "identity_card",
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          base64Data,
        });
        nextDocuments.push({
          type: "identity_card",
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          base64Data,
        });
      } catch (error) {
        console.error(error);
        toast.error(t("invalid_document_file"));
      }
    }

    if (nextDocuments.length > 0) {
      form.setFieldValue("documents", [...documents, ...nextDocuments]);
    }
  };

  const handleDocumentTypeChange = (
    index: number,
    type: SignupDocument["type"],
  ) => {
    form.setFieldValue(
      "documents",
      documents.map((doc, docIndex) =>
        docIndex === index ? { ...doc, type } : doc,
      ),
    );
  };

  const handleRemoveDocument = (index: number) => {
    form.setFieldValue(
      "documents",
      documents.filter((_, docIndex) => docIndex !== index),
    );
  };

  const documentTypeOptions = useMemo(
    () => [
      { value: "identity_card" as const, label: t("document_identity_card") },
      {
        value: "identity_appendix" as const,
        label: t("document_identity_appendix"),
      },
    ],
    [t],
  );

  return (
    <main className="bg-muted flex min-h-screen items-center justify-center px-4 py-12">
      <div className="bg-background w-full max-w-4xl space-y-8 rounded-3xl p-8 shadow-xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/square-logo.svg"
              alt={t("beneficiary_logo_alt")}
              className="h-12 w-12"
            />
            <div>
              <h1 className="text-2xl font-semibold">{t("signup_title")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("signup_subtitle")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              void navigate({
                to: "/login",
                search: { nationalId: undefined },
              });
            }}
          >
            {t("back_to_login")}
          </Button>
        </header>

        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <section className="space-y-4">
            <h2 className="text-lg font-medium">{t("applicant_details")}</h2>
            <FieldGroup>
              <form.Field
                name="firstName"
                children={(field) => renderTextField(field, t("first_name"))}
              />
              <form.Field
                name="lastName"
                children={(field) => renderTextField(field, t("last_name"))}
              />
            </FieldGroup>
            <FieldGroup>
              <form.Field
                name="nationalId"
                children={(field) => renderTextField(field, t("national_id"))}
              />
              <form.Field
                name="dateOfBirth"
                children={(field) => renderDateField(field, t("date_of_birth"))}
              />
            </FieldGroup>
            <FieldGroup>
              <form.Field
                name="personalPhoneNumber"
                children={(field) =>
                  renderTextField(field, t("personal_phone_number"), {
                    type: "tel",
                  })
                }
              />
              <form.Field
                name="homePhoneNumber"
                children={(field) =>
                  renderTextField(field, t("home_phone_number"), {
                    type: "tel",
                    placeholder: t("optional"),
                  })
                }
              />
            </FieldGroup>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium">{t("address_information")}</h2>
            <FieldGroup>
              <form.Field
                name="address.cityId"
                children={(cityIdField) => (
                  <form.Field
                    name="address.cityCode"
                    children={(cityCodeField) => (
                      <form.Field
                        name="address.streetId"
                        children={(streetIdField) => (
                          <AddressFields
                            cityIdField={cityIdField}
                            cityCodeField={cityCodeField}
                            streetIdField={streetIdField}
                            isSubmitting={isSubmitting}
                          />
                        )}
                      />
                    )}
                  />
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <form.Field
                name="address.houseNumber"
                children={(field) => renderTextField(field, t("house_number"))}
              />
              <form.Field
                name="address.addressLine2"
                children={(field) =>
                  renderTextField(field, t("address_line_two"), {
                    placeholder: t("address_line_two_placeholder"),
                  })
                }
              />
              <form.Field
                name="address.postalCode"
                children={(field) => renderTextField(field, t("postal_code"))}
              />
            </FieldGroup>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium">{t("family_status")}</h2>
            <FieldGroup>
              <form.Field
                name="maritalStatus"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel>{t("marital_status")}</FieldLabel>
                      </FieldContent>
                      <Select
                        defaultValue={field.state.value}
                        disabled={isSubmitting}
                        onValueChange={(value: MaritalStatus) =>
                          field.handleChange(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("select_marital_status")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">
                            {t("status_single")}
                          </SelectItem>
                          <SelectItem value="married">
                            {t("status_married")}
                          </SelectItem>
                          <SelectItem value="divorced">
                            {t("status_divorced")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            {maritalStatus !== "single" && spouse && (
              <div className="border-border rounded-xl border p-4">
                <h3 className="mb-4 text-base font-medium">
                  {t("spouse_details")}
                </h3>
                <FieldGroup>
                  <form.Field
                    name="spouse.firstName"
                    children={(field) =>
                      renderTextField(field, t("first_name"))
                    }
                  />
                  <form.Field
                    name="spouse.lastName"
                    children={(field) => renderTextField(field, t("last_name"))}
                  />
                </FieldGroup>
                <FieldGroup>
                  <form.Field
                    name="spouse.nationalId"
                    children={(field) =>
                      renderTextField(field, t("national_id"))
                    }
                  />
                  <form.Field
                    name="spouse.phoneNumber"
                    children={(field) =>
                      renderTextField(field, t("phone_number_optional"), {
                        type: "tel",
                        placeholder: t("optional"),
                      })
                    }
                  />
                </FieldGroup>
                <FieldGroup>
                  <form.Field
                    name="spouse.dateOfBirth"
                    children={(field) =>
                      renderDateField(field, t("date_of_birth"))
                    }
                  />
                </FieldGroup>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium">{t("children_information")}</h2>
            <FieldGroup>
              <form.Field
                name="childrenCount"
                children={(field) =>
                  renderNumberField(field, t("number_of_children"), {
                    min: 0,
                    max: 20,
                  })
                }
              />
            </FieldGroup>
            <form.Field
              name="children"
              mode="array"
              children={(field) => (
                <div className="space-y-4">
                  {field.state.value.map((_, index) => (
                    <div
                      key={index}
                      className="border-border rounded-xl border p-4"
                    >
                      <h3 className="text-muted-foreground mb-4 text-sm font-medium uppercase">
                        {t("child_number_label", { number: index + 1 })}
                      </h3>
                      <FieldGroup>
                        <form.Field
                          name={`children[${index}].firstName`}
                          children={(childField) =>
                            renderTextField(childField, t("first_name"))
                          }
                        />
                        <form.Field
                          name={`children[${index}].lastName`}
                          children={(childField) =>
                            renderTextField(childField, t("last_name"), {
                              readOnly: true,
                            })
                          }
                        />
                      </FieldGroup>
                      <FieldGroup>
                        <form.Field
                          name={`children[${index}].nationalId`}
                          children={(childField) =>
                            renderTextField(childField, t("national_id"))
                          }
                        />
                        <form.Field
                          name={`children[${index}].dateOfBirth`}
                          children={(childField) =>
                            renderDateField(childField, t("date_of_birth"))
                          }
                        />
                      </FieldGroup>
                    </div>
                  ))}
                  {childrenCount > 0 &&
                    field.state.value.length !== childrenCount && (
                      <p className="text-destructive text-sm">
                        {t("children_mismatch_hint")}
                      </p>
                    )}
                </div>
              )}
            />
          </section>

          {documentsRequirement !== "hidden" && (
            <section className="space-y-4">
              <h2 className="text-lg font-medium">{t("identity_documents")}</h2>
              <p className="text-muted-foreground text-sm">
                {documentsRequirement === "required"
                  ? t("documents_required_hint")
                  : t("documents_optional_hint")}
              </p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(event) => {
                  void handleFilesSelected(event.target.files);
                  event.target.value = "";
                }}
                disabled={isSubmitting}
                className="text-sm"
              />
              {documents.length > 0 && (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={`${doc.fileName}-${index}`}
                      className="border-border flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-muted-foreground text-sm">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                          {doc.mimeType}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          defaultValue={doc.type}
                          onValueChange={(value: SignupDocument["type"]) =>
                            handleDocumentTypeChange(index, value)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveDocument(index)}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <details className="bg-muted/60 rounded-lg p-4 text-sm">
                <summary className="cursor-pointer font-medium">
                  {t("how_to_find_appendix")}
                </summary>
                <p className="mt-2">
                  <a
                    href={`https://www.gov.il/${i18n.language}/service/renew_id_appendix`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {t("gov_appendix_link_text")}
                  </a>
                </p>
              </details>
            </section>
          )}

          <section className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? t("submitting") : t("submit_application")}
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              {t("signup_disclaimer")}
            </p>
          </section>
        </form>
      </div>
    </main>
  );
}

function renderTextField(
  field: AnyFieldApi,
  label: string,
  options?: {
    type?: string;
    placeholder?: string;
    readOnly?: boolean;
  },
) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </FieldContent>
      <Input
        id={field.name}
        type={options?.type ?? "text"}
        value={(field.state.value as string | undefined) ?? ""}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={options?.placeholder}
        readOnly={options?.readOnly}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function renderDateField(field: AnyFieldApi, label: string) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </FieldContent>
      <Input
        id={field.name}
        type="date"
        value={(field.state.value as string | undefined) ?? ""}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function renderNumberField(
  field: AnyFieldApi,
  label: string,
  options?: { min?: number; max?: number },
) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </FieldContent>
      <Input
        id={field.name}
        type="number"
        value={(field.state.value as number | undefined) ?? 0}
        min={options?.min}
        max={options?.max}
        onBlur={field.handleBlur}
        onChange={(event) => {
          const nextValue = Number.isNaN(event.target.valueAsNumber)
            ? 0
            : event.target.valueAsNumber;
          field.handleChange(nextValue);
        }}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

function calculateAge(isoDate: string): number {
  const birthDate = new Date(isoDate);
  if (Number.isNaN(birthDate.getTime())) {
    return Number.NaN;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (event) => reject(new Error(event.target?.error?.message));
    reader.readAsDataURL(file);
  });
}
