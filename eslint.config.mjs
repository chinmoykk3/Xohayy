import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react/no-danger": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            "dangerouslySetInnerHTML is strictly forbidden (Plan Section 24.1, ADR-005). Do not inject raw HTML.",
        },
        {
          selector: "Property[key.name='dangerouslySetInnerHTML']",
          message: "dangerouslySetInnerHTML is strictly forbidden. Do not inject raw HTML.",
        },
      ],
      "react/no-danger": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            "dangerouslySetInnerHTML is strictly forbidden (Plan Section 24.1, ADR-005). Do not inject raw HTML.",
        },
        {
          selector: "Property[key.name='dangerouslySetInnerHTML']",
          message: "dangerouslySetInnerHTML is strictly forbidden. Do not inject raw HTML.",
        },
      ],
    },
  },
  {
    files: ["scripts/**", "tests/**"],
    rules: {
      "no-console": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
