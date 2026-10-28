import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
    stylistic.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        plugins: {
            js,
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/no-extra-semi": "error",
            "@stylistic/line-comment-position": ["error", { position: "above" }],
            "@stylistic/no-mixed-operators": "error",

            "@stylistic/quotes": ["warn", "double"],
            "@stylistic/array-bracket-spacing": ["warn", "never", { singleValue: false }],
            "@stylistic/semi-style": ["warn", "last"],
            "prefer-const": ["error", { destructuring: "all" }],
        },
        extends: ["js/recommended"],
        languageOptions: {
            globals: globals.node,
        },
    },

    tseslint.configs.recommended,
    globalIgnores(
        [
            "out/**",
            "build/**",
            ".vscode",
            "node_modules",
            "dist/**",
        ],
    ),
]);
