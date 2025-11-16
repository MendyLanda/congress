import type { UseFormReturn } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import type { UseMutationResult } from "@tanstack/react-query";

import { Button } from "@congress/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@congress/ui/field";
import { Input } from "@congress/ui/input";
import { toast } from "@congress/ui/toast";

interface OtpStepProps {
  otpForm: UseFormReturn<{ otp: string }, unknown>;
  maskedPhoneNumber: string | null;
  formData: {
    nationalId: string;
    personalPhoneNumber: string;
  } | null;
  setStep: (step: "form" | "otp") => void;
  sendSignupOtpMutation: UseMutationResult<
    unknown,
    Error,
    { nationalId: string; phoneNumber: string },
    unknown
  >;
  signupMutation: UseMutationResult<unknown, Error, unknown, unknown>;
}

export function OtpStep({
  otpForm,
  maskedPhoneNumber,
  formData,
  setStep,
  sendSignupOtpMutation,
  signupMutation,
}: OtpStepProps) {
  const { t } = useTranslation();

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void otpForm.handleSubmit();
      }}
    >
      <div className="text-muted-foreground space-y-2 text-sm">
        <p>
          {maskedPhoneNumber
            ? t("otp_sent_message", {
                phoneNumber: maskedPhoneNumber,
              })
            : t("otp_sent_message_no_phone")}
        </p>
      </div>
      <FieldGroup>
        <otpForm.Field
          name="otp"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    {t("verification_code_label")}
                  </FieldLabel>
                </FieldContent>
                <Input
                  id={field.name}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.4em]"
                  disabled={
                    otpForm.state.isSubmitting ||
                    signupMutation.isPending ||
                    sendSignupOtpMutation.isPending
                  }
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />
      </FieldGroup>
      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={
            otpForm.state.isSubmitting ||
            signupMutation.isPending ||
            sendSignupOtpMutation.isPending
          }
        >
          {otpForm.state.isSubmitting || signupMutation.isPending
            ? t("submitting")
            : t("submit_application")}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Button
            type="button"
            variant="link"
            disabled={sendSignupOtpMutation.isPending}
            onClick={() => {
              if (!formData) {
                toast.error(t("form_data_missing"));
                setStep("form");
                return;
              }
              void sendSignupOtpMutation.mutateAsync({
                nationalId: formData.nationalId,
                phoneNumber: formData.personalPhoneNumber,
              });
            }}
          >
            {t("resend_code")}
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setStep("form");
              otpForm.reset();
            }}
          >
            {t("back")}
          </Button>
        </div>
      </div>
    </form>
  );
}

