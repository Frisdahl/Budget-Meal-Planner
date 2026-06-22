import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Moon, Sun, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { Meal } from "@/types";

type MealThumbnailProps = {
  image?: string;
  mealType: Meal["type"];
  title?: string;
  className?: string;
};

const MEAL_ICONS: Record<Meal["type"], LucideIcon> = {
  breakfast: Sun,
  lunch: UtensilsCrossed,
  dinner: Moon,
};

export function MealThumbnail({
  image,
  mealType,
  title = "",
  className,
}: MealThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image?.trim()) && !imageFailed;
  const Icon = MEAL_ICONS[mealType];

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
    <div className={cn("meal-thumbnail-wrapper", className)}>
      {showImage ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="meal-thumbnail"
        />
      ) : (
        <div
          className="meal-thumbnail-fallback"
          aria-hidden={title ? undefined : true}
        >
          <Icon className="meal-thumbnail-icon" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
