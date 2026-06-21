import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Typography";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <Container className="flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
        <Text variant="caption" as="span">
          &copy; {new Date().getFullYear()} Budget Meal Planner
        </Text>
        <Text variant="caption" as="span">
          Planlæg smartere. Spis bedre. Hold budgettet.
        </Text>
      </Container>
    </footer>
  );
}
