import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Vendored shadcn/ui files: keep them as the CLI writes them.
    files: ["components/ui/**", "hooks/use-mobile.ts"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/prototype-registry.generated.ts",
    ".capture/**",
    // Imported static snapshots are checked in their source project.
    "public/embeds/**",
  ]),
]);

export default eslintConfig;
