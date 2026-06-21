import { PageContainer } from "@/components/layout/PageContainer";
import { GeneratedMealPlan } from "@/components/meal-plan/GeneratedMealPlan";
import { LoadingSpinner } from "@/components/meal-plan/LoadingSpinner";
import { MealPlanForm } from "@/components/meal-plan/MealPlanForm";
import { EmptyState, Text } from "@/components/ui";
import { useMealPlanSession } from "@/hooks/useMealPlanSession";
import { CalendarRange } from "lucide-react";

export function MealPlanPage() {
  const {
    criteria,
    plan,
    error,
    optimizeMessage,
    optimizationSavings,
    isGenerating,
    isOptimizing,
    setCriteria,
    generate,
    makeCheaper,
    swapMeal,
  } = useMealPlanSession();

  const isLoading = isGenerating || isOptimizing;

  return (
    <PageContainer
      wide
      title="Madplan"
      description="Indstil budget og præferencer, og generer en madplan tilpasset dig."
    >
      <div className="flex flex-col gap-12">
        <MealPlanForm
          values={criteria}
          onChange={setCriteria}
          onGenerate={generate}
          isGenerating={isGenerating}
        />

        {error && (
          <div className="rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 shadow-sm">
            <Text variant="body-sm" className="text-accent-800">
              {error}
            </Text>
          </div>
        )}

        {plan ? (
          <GeneratedMealPlan
            plan={plan}
            onMakeCheaper={makeCheaper}
            onSwapMeal={swapMeal}
            isOptimizing={isOptimizing}
            optimizeMessage={optimizeMessage}
            optimizationSavings={optimizationSavings}
          />
        ) : isGenerating ? (
          <EmptyState
            className="animate-fade-in rounded-2xl border-neutral-200 bg-white py-16 shadow-[var(--shadow-card)]"
            icon={<LoadingSpinner className="h-6 w-6" />}
            title="Genererer madplan..."
            description="Vi samler opskrifter og beregner priser ud fra dit budget."
          />
        ) : (
          <EmptyState
            className="animate-fade-in rounded-2xl border-neutral-200 bg-white py-16 shadow-[var(--shadow-card)]"
            icon={
              <CalendarRange
                className="h-6 w-6 text-neutral-400"
                strokeWidth={1.75}
                aria-hidden
              />
            }
            title="Klar til at planlægge?"
            description="Vælg budget, dage og kostvalg for at generere din madplan."
          />
        )}

        {isLoading && plan && (
          <p className="sr-only" role="status">
            {isGenerating ? "Genererer madplan" : "Optimerer madplan"}
          </p>
        )}
      </div>
    </PageContainer>
  );
}
