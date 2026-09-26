import { icons, type LucideProps } from "lucide-react";

// Renders a lucide-react icon looked up by name at runtime, so content
// editors can pick any icon from https://lucide.dev/icons without a
// front-end code change — see the shared `icon` object schema in
// studio/schemaTypes/objects/icon.ts. `name` is kebab-case exactly as
// lucide.dev displays it (e.g. "map-pin"); lucide's own icon map is keyed
// PascalCase, so it's converted before lookup.
function toPascalCase(kebabName: string): string {
  return kebabName
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

export function DynamicIcon({ name, ...props }: { name?: string | null } & LucideProps) {
  if (!name) return null;
  const Icon = icons[toPascalCase(name) as keyof typeof icons];
  if (!Icon) return null;
  return <Icon {...props} />;
}
