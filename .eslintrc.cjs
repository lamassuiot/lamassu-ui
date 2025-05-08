const { warn } = require("console");

module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        "plugin:react/recommended",
        "plugin:eqeqeq-fix/recommended",
        "standard"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: false
    },
    plugins: [
        "react",
        "@typescript-eslint",
        "unused-imports"
    ],
    rules: {
        quotes: [
            "error",
            "double"
        ],
        // "@typescript-eslint/no-explicit-any": "error",
        "unused-imports/no-unused-imports": "error",
        "no-use-before-define": "off",
        "consistent-return": 2,
        indent: [1, 4],
        "no-else-return": 1,
        semi: [1, "always"],
        "space-unary-ops": 2,
        camelcase: "off",
        "react/prop-types": "off",
        "no-unused-vars": "off",
        "react/react-in-jsx-scope": "off"

    },
    settings: {
        react: {
            version: "detect"
        }
    }
};
