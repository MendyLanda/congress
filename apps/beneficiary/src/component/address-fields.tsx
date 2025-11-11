import type { AnyFieldApi } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { AutoComplete } from "@congress/ui/autocomplete";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@congress/ui/field";
import { Input } from "@congress/ui/input";

import { useTRPC } from "~/lib/trpc";

interface AddressFieldsProps {
  cityIdField: AnyFieldApi;
  streetIdField: AnyFieldApi;
  cityCodeField: AnyFieldApi;
  isSubmitting: boolean;
}

export function AddressFields({
  cityIdField,
  streetIdField,
  cityCodeField,
  isSubmitting,
}: AddressFieldsProps) {
  const { t } = useTranslation();
  const trpc = useTRPC();

  const [citySearch, setCitySearch] = useState("");
  const [streetSearch, setStreetSearch] = useState("");

  const cityId = cityIdField.state.value as number;
  const cityCode = cityCodeField.state.value as number;

  const citiesQuery = useQuery(
    trpc.location.cities.queryOptions(
      { search: citySearch || undefined },
      { enabled: true },
    ),
  );

  const streetsQuery = useQuery(
    trpc.location.streets.queryOptions(
      {
        cityCode: cityCode || 0,
        search: streetSearch || undefined,
      },
      { enabled: Boolean(cityCode) },
    ),
  );

  const cityItems = useMemo(
    () =>
      citiesQuery.data?.map((city) => ({
        value: String(city.id),
        label: city.nameHe,
      })) || [],
    [citiesQuery.data],
  );

  const streetItems = useMemo(
    () =>
      streetsQuery.data?.map((street) => ({
        value: String(street.id),
        label: street.nameHe,
      })) || [],
    [streetsQuery.data],
  );

  const cityIsInvalid =
    cityIdField.state.meta.isTouched && !cityIdField.state.meta.isValid;
  const streetIsInvalid =
    streetIdField.state.meta.isTouched && !streetIdField.state.meta.isValid;

  return (
    <>
      <Field data-invalid={cityIsInvalid}>
        <FieldContent>
          <FieldLabel>{t("city")}</FieldLabel>
        </FieldContent>
        <AutoComplete
          selectedValue={cityId ? String(cityId) : ""}
          onSelectedValueChange={(value: string) => {
            const selectedCity = citiesQuery.data?.find(
              (city) => String(city.id) === value,
            );
            const newCityId = value ? Number.parseInt(value, 10) : 0;
            const newCityCode = selectedCity?.code ?? 0;

            cityIdField.handleChange(newCityId);
            cityCodeField.handleChange(newCityCode);
            streetIdField.handleChange(0);
            setStreetSearch("");
          }}
          searchValue={citySearch}
          onSearchValueChange={setCitySearch}
          items={cityItems}
          isLoading={citiesQuery.isLoading}
          emptyMessage={t("no_cities_found")}
          placeholder={t("select_city_placeholder")}
        />
        {cityIsInvalid && <FieldError errors={cityIdField.state.meta.errors} />}
      </Field>
      <Field data-invalid={streetIsInvalid}>
        <FieldContent>
          <FieldLabel>{t("street")}</FieldLabel>
        </FieldContent>
        {cityCode ? (
          <AutoComplete
            selectedValue={
              streetIdField.state.value ? String(streetIdField.state.value) : ""
            }
            onSelectedValueChange={(value: string) => {
              streetIdField.handleChange(
                value ? Number.parseInt(value, 10) : 0,
              );
            }}
            searchValue={streetSearch}
            onSearchValueChange={setStreetSearch}
            items={streetItems}
            isLoading={streetsQuery.isLoading}
            emptyMessage={t("no_streets_found")}
            placeholder={t("select_street_placeholder")}
          />
        ) : (
          <Input
            value={String(streetIdField.state.value || "")}
            onBlur={streetIdField.handleBlur}
            onChange={(event) =>
              streetIdField.handleChange(
                Number.parseInt(event.target.value, 10) || 0,
              )
            }
            disabled={isSubmitting}
            placeholder={t("street_placeholder")}
          />
        )}
        {streetIsInvalid && (
          <FieldError errors={streetIdField.state.meta.errors} />
        )}
      </Field>
    </>
  );
}
