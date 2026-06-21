import { type FormEvent } from "react";
import { formatCurrency } from "@/lib/format";
import { FEED_STORES } from "@/lib/stores";
import {
  DIETARY_PREFERENCES,
  type DietaryPreferenceId,
} from "@/data/mealPlanOptions";
import type { MealPlanCriteria } from "@/types/mealPlan";
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
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
  function togglePreference(id: DietaryPreferenceId) {
    onChange({
      ...values,
      dietaryPreferences: values.dietaryPreferences.includes(id)
        ? values.dietaryPreferences.filter((preference) => preference !== id)
        : [...values.dietaryPreferences, id],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onGenerate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planlæg din madplan</CardTitle>
        <CardDescription>
          Angiv budget, antal personer, dage og supermarked — vi genererer en
          madplan tilpasset dine behov.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-lg">
        <div className="grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Budget (DKK)"
            type="number"
            min={100}
            step={50}
            value={values.budget}
            onChange={(e) =>
              onChange({
                ...values,
                budget: Number(e.target.value) || 0,
              })
            }
            hint="Samlet budget for hele perioden"
          />
          <Input
            label="Antal personer"
            type="number"
            min={1}
            max={12}
            value={values.people}
            onChange={(e) =>
              onChange({
                ...values,
                people: Number(e.target.value) || 1,
              })
            }
            hint="Hvor mange skal spise med?"
          />
          <Input
            label="Antal dage"
            type="number"
            min={1}
            max={7}
            value={values.days}
            onChange={(e) =>
              onChange({
                ...values,
                days: Number(e.target.value) || 1,
              })
            }
            hint="Planlæg op til 7 dage ad gangen"
          />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-label">Supermarked</legend>
          <div className="flex flex-wrap gap-2">
            {FEED_STORES.map((store) => (
              <TogglePill
                key={store}
                active={values.store === store}
                onClick={() => onChange({ ...values, store })}
              >
                {store}
              </TogglePill>
            ))}
          </div>
          <p className="text-caption">
            Priser og indkøbsliste baseres på valgt supermarked
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-label">Kostpræferencer</legend>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map(({ id, label }) => (
              <TogglePill
                key={id}
                active={values.dietaryPreferences.includes(id)}
                onClick={() => togglePreference(id)}
              >
                {label}
              </TogglePill>
            ))}
          </div>
          <p className="text-caption">Vælg en eller flere — valgfrit</p>
        </fieldset>

        <Textarea
          label="Allergier & intolerancer"
          placeholder="F.eks. nødder, skaldyr, æg, soja..."
          value={values.allergies}
          onChange={(e) =>
            onChange({ ...values, allergies: e.target.value })
          }
          hint="Adskil flere allergier med komma. Vi undgår disse ingredienser i planen."
          rows={3}
        />

        <div className="flex flex-col gap-3 border-t border-neutral-100 pt-stack-md sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-sm text-neutral-500">
            Estimeret: {values.days} dage · {values.people} person
            {values.people !== 1 ? "er" : ""} · {values.store} ·{" "}
            {formatCurrency(values.budget)} budget
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={isGenerating || values.budget < 100 || values.days < 1}
            className="w-full sm:w-auto"
          >
            {isGenerating ? "Genererer..." : "Generer madplan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
