import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  actions?: ReactNode;
  wide?: boolean;
};

export function PageContainer({
  title,
  description,
  actions,
  wide = false,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <main className={cn("flex-1", className)} {...props}>
      <Container
        size={wide ? "wide" : "default"}
        className="py-8 lg:py-12"
      >
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-12">
          <div className="flex max-w-3xl flex-col gap-2">
            <Heading as={1} className="text-page-title">
              {title}
            </Heading>
            {description && (
              <Text
                variant="body-lg"
                className="text-[15px] leading-relaxed text-neutral-500 sm:text-base"
              >
                {description}
              </Text>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
        {children}
      </Container>
    </main>
  );
}
