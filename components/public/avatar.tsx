import { useId } from "react";
import { avatarMarkup, type AvatarTraits } from "@/lib/avatar";

export type { AvatarTraits };

// Avatar ilustrado y personalizable: los rasgos salen de `members.json` (campo `avatar`).
export function Avatar({
  traits,
  label,
  className,
}: {
  traits: AvatarTraits;
  label: string;
  className?: string;
}) {
  const clip = "av" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={className}
      dangerouslySetInnerHTML={{ __html: avatarMarkup(traits, clip) }}
    />
  );
}
