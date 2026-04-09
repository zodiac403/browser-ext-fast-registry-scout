import eslintJs from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
        },
        rules: {
            "comma-dangle": ["error", "always-multiline"],
            "max-len": ["error", { "code": 120 }],
            "one-var": ["error", "never"],
        },
    },
    eslintJs.configs.all,
    {
        files: ["tests/**/*.js"],
        rules: {
            "no-magic-numbers": "off",
            "prefer-destructuring": "off",
            "sort-keys": "off",
        },
    },
];
