import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageContainer({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <main className={cn("flex-1", className)} {...props}>
      <Container className="py-section-y lg:py-section-y-lg">
      <header className="mb-stack-xl flex flex-col gap-stack-md sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-stack-sm">
          <Heading as={1} size="xl">
            {title}
          </Heading>
          {description && (
            <Text variant="body-lg" className="max-w-2xl text-neutral-600">
              {description}
            </Text>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {children}
      </Container>
    </main>
  );
}
