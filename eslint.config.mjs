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
        rules: {
            "max-statements": "off",
            "sort-keys": "off",
        },
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "max-lines-per-function": "off",
            "no-magic-numbers": "off",
            "prefer-destructuring": "off",
        },
    },
];
