import eslintJs from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.webextensions
            }
        },
        rules: {
            "one-var": ["error", "never"]
        }
    },
    eslintJs.configs.all,
];
