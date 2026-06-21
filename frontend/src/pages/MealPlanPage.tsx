import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { GeneratedMealPlan } from "@/components/meal-plan/GeneratedMealPlan";
import { MealPlanForm } from "@/components/meal-plan/MealPlanForm";
import { EmptyState, Text } from "@/components/ui";
import { useMealPlanSession } from "@/hooks/useMealPlanSession";

export function MealPlanPage() {
  const {
    criteria,
    plan,
    status,
    error,
    isGenerating,
    setCriteria,
    generate,
  } = useMealPlanSession();

  return (
    <PageContainer
      title="Madplan"
      description="Indstil budget og præferencer, og generer en madplan tilpasset dig."
    >
      <div className="flex flex-col gap-stack-xl">
        <MealPlanForm
          values={criteria}
          onChange={setCriteria}
          onGenerate={generate}
          isGenerating={isGenerating}
        />

        {error && (
          <Text variant="body-sm" className="text-error">
            {error}
          </Text>
        )}

        {plan ? (
          <GeneratedMealPlan plan={plan} />
        ) : status === "generating" ? (
          <EmptyState
            icon={<span className="text-2xl">⏳</span>}
            title="Genererer madplan..."
            description="Vi samler en placeholder-plan baseret på dine valg."
          />
        ) : (
          <EmptyState
            icon={<span className="text-2xl">🍽️</span>}
            title="Ingen madplan endnu"
            description="Udfyld formularen ovenfor og tryk «Generer madplan» for at se din plan med placeholder-data."
            action={
              <Link
                to="/shopping-list"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Gå til indkøbsliste
              </Link>
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
