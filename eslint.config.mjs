import { defineConfig, globalIgnores } from "eslint/config"
import studio from "@sanity/eslint-config-studio"
import unusedImports from "eslint-plugin-unused-imports"
import prettier from "eslint-config-prettier/flat"

const eslintConfig = defineConfig([
  ...studio,
  prettier,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      quotes: [`error`, `backtick`],
      "no-undef": `error`,
      "prefer-const": `warn`,
      "unused-imports/no-unused-imports": `error`,
      "unused-imports/no-unused-vars": `warn`,
    },
  },
  globalIgnores([`.next/**`, `node_modules/**`]),
])

export default eslintConfig
