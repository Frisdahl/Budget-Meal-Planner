import { type FormEvent } from "react";
import { formatCurrency } from "@/lib/format";
import { FEED_STORES } from "@/lib/stores";
import {
  MEAL_PLAN_DIET_FILTERS,
  type MealPlanDietFilterKey,
} from "@/data/mealPlanOptions";
import type { MealPlanCriteria } from "@/types/mealPlan";
import { FormSection } from "./FormSection";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Textarea,
  TogglePill,
} from "@/components/ui";

type MealPlanFormProps = {
  values: MealPlanCriteria;
  onChange: (values: MealPlanCriteria) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
};

export function MealPlanForm({
  values,
  onChange,
  onGenerate,
  isGenerating = false,
}: MealPlanFormProps) {
  function toggleDietFilter(key: MealPlanDietFilterKey) {
    onChange({
      ...values,
      [key]: !values[key],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onGenerate();
  }

  const isDisabled = isGenerating;

  return (
    <Card
      padding="none"
      className="animate-fade-in overflow-hidden rounded-2xl border-neutral-200"
    >
      <CardHeader className="mb-0 border-b border-neutral-200/80 bg-neutral-50/50 px-4 py-5 sm:px-6">
        <CardTitle className="text-section-title">Planlæg din madplan</CardTitle>
        <CardDescription className="max-w-2xl text-[15px] leading-relaxed">
          Vælg budget, periode og kostvalg — så bygger vi en plan, der passer.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 p-4 sm:p-6"
      >
        <FormSection
          title="Budget"
          description="Samlet budget for hele perioden hos valgt supermarked."
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Budget (DKK)"
              type="number"
              min={100}
              step={50}
              value={values.budget}
              disabled={isDisabled}
              onChange={(e) =>
                onChange({
                  ...values,
                  budget: Number(e.target.value) || 0,
                })
              }
            />
            <div>
              <p className="mb-2.5 text-label">Supermarked</p>
              <div className="flex flex-wrap gap-2">
                {FEED_STORES.map((store) => (
                  <TogglePill
                    key={store}
                    active={values.store === store}
                    disabled={isDisabled}
                    onClick={() => onChange({ ...values, store })}
                  >
                    {store}
                  </TogglePill>
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Antal dage og personer"
          description="Hvor mange dage og hvor mange personer skal planen dække?"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Antal dage"
              type="number"
              min={1}
              max={7}
              value={values.days}
              disabled={isDisabled}
              onChange={(e) =>
                onChange({
                  ...values,
                  days: Number(e.target.value) || 1,
                })
              }
              hint="Op til 7 dage"
            />
            <Input
              label="Antal personer"
              type="number"
              min={1}
              max={12}
              value={values.people}
              disabled={isDisabled}
              onChange={(e) =>
                onChange({
                  ...values,
                  people: Number(e.target.value) || 1,
                })
              }
              hint="1–12 personer"
            />
          </div>
        </FormSection>

        <FormSection
          title="Kostvalg og allergier"
          description="Filtrer opskrifter før generering."
        >
          <div className="flex flex-col gap-4">
            <div className="grid gap-0 sm:grid-cols-2">
              {MEAL_PLAN_DIET_FILTERS.map(({ key, label }) => (
                <Checkbox
                  key={key}
                  id={`diet-filter-${key}`}
                  label={label}
                  checked={values[key]}
                  disabled={isDisabled}
                  onChange={() => toggleDietFilter(key)}
                />
              ))}
            </div>
            <Textarea
              label="Andre allergier (noter)"
              placeholder="F.eks. skaldyr, æg, soja..."
              value={values.allergies}
              disabled={isDisabled}
              onChange={(e) =>
                onChange({ ...values, allergies: e.target.value })
              }
              hint="Valgfri note — bruges ikke til filtrering endnu."
              rows={2}
            />
          </div>
        </FormSection>

        <div className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/40 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-[15px] leading-relaxed text-neutral-600">
            {values.days} dage · {values.people} person
            {values.people !== 1 ? "er" : ""} · {values.store} ·{" "}
            <span className="font-semibold text-neutral-900">
              {formatCurrency(values.budget)}
            </span>
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={isDisabled || values.budget < 100 || values.days < 1}
            className="w-full shrink-0 sm:w-auto sm:min-w-[12rem]"
          >
            {isGenerating && <LoadingSpinner light />}
            {isGenerating ? "Genererer madplan..." : "Generer madplan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
