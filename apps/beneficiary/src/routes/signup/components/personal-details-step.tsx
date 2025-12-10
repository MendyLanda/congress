import { useTranslation } from "react-i18next";
import { z } from "zod/v4";

import type { AppForm } from "@congress/ui/fields";
import { Button } from "@congress/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@congress/ui/field";
import { Input } from "@congress/ui/input";
import { passwordSchema } from "@congress/validators";



interface PersonalDetailsStepProps {
  passwordForm: AppForm;
  onBack: () => void;
  isBusy: boolean;
}

export function PersonalDetailsStep({
  personalDetailsForm,
  onBack,
  isBusy,
}: PersonalDetailsStepProps) {
  const { t } = useTranslation();

  return (
   
  );
}

