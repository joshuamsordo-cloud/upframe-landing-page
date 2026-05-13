import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["site/**/*.jsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Browser
        window: "readonly",
        document: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        IntersectionObserver: "readonly",
        PointerEvent: "readonly",
        // CDN globals — React declared per-file via /* global React */
        ReactDOM: "readonly",
        // Cross-file components (set on window via Object.assign, loaded in script-tag order)
        Mark: "readonly",
        Wordmark: "readonly",
        Eyebrow: "readonly",
        RevealController: "readonly",
        splitWords: "readonly",
        Btn: "readonly",
        Nav: "readonly",
        Hero: "readonly",
        QuoteRace: "readonly",
        TheLeakSection: "readonly",
        ROISection: "readonly",
        MiniSite: "readonly",
        NodeGraph: "readonly",
        AgentChat: "readonly",
        ServicesSection: "readonly",
        ProcessSection: "readonly",
        TestimonialsSection: "readonly",
        ClosingSection: "readonly",
        Footer: "readonly",
        FloatingAgent: "readonly",
      },
    },
    settings: {
      react: { version: "18" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "error",
      // Components exported via Object.assign(window,...) look unused to ESLint
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z]" }],
      // eslint-plugin-react v7 + ESLint 9 flat config: jsx-no-undef doesn't read
      // languageOptions.globals correctly. no-undef (from js.configs.recommended)
      // handles this correctly and respects our globals config.
      "react/jsx-no-undef": "off",
      "no-redeclare": "off",
    },
  },
];
