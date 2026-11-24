/**
 * The playground's top-level folders, in the order the home page shows them.
 * Every prototype names one in `metadata.json → folder`; the registry rejects anything else.
 * `docs` holds the research documents in `docs/*.md`, not prototypes.
 */
export const FOLDERS = [
  { id: "docs", title: "Docs" },
  { id: "design-system", title: "Design system" },
  { id: "pine-one", title: "Pine One" },
  { id: "pine-one-app", title: "Pine One app" },
  { id: "pine-omni", title: "Pine Omni" },
  { id: "pine-omni-app", title: "Pine Omni app" },
  { id: "pine-labs-pg", title: "Pine Labs PG" },
  { id: "agents", title: "Agents" },
  { id: "onboarding", title: "Onboarding" },
] as const;

export type FolderId = (typeof FOLDERS)[number]["id"];
export type PrototypeFolderId = Exclude<FolderId, "docs">;
export type Folder = (typeof FOLDERS)[number];

export function getFolder(id: string): Folder | undefined {
  return FOLDERS.find((f) => f.id === id);
}
