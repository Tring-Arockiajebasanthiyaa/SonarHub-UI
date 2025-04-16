/**
 * @file ESLint configuration for the project using TypeScript and React plugins.
 * @description Defines linting rules and environment settings for code quality enforcement.
 * This configuration uses modern ECMAScript features, integrates TypeScript and React best practices,
 * and ensures consistent linting behavior across the codebase.
 * @author
 * @created 2025-04-15
 */

// Import ESLint's recommended JavaScript configuration
import js from '@eslint/js';

// Provides global variables definitions for environments like browsers
import globals from 'globals';

// Enforces best practices with React Hooks (like correct dependency arrays)
import reactHooks from 'eslint-plugin-react-hooks';

// Enables better support for React Fast Refresh (Hot Module Replacement)
import reactRefresh from 'eslint-plugin-react-refresh';

// Main TypeScript-ESLint integration
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore the "dist" folder from linting
  { ignores: ['dist'] },

  {
    // Extend base ESLint + TypeScript recommended rule sets
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    // Apply ESLint only to .ts and .tsx files in the project
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      // Set ECMAScript version to 2020 (allows optional chaining, nullish coalescing, etc.)
      ecmaVersion: 2020,

      // Use browser-specific global variables like window, document, etc.
      globals: globals.browser,
    },

    plugins: {
      // React Hooks plugin to catch missing dependencies and invalid hook usage
      'react-hooks': reactHooks,

      // React Refresh plugin to warn when components are not exported properly for HMR
      'react-refresh': reactRefresh
    },

    rules: {
      // Use recommended rules for React Hooks to avoid common bugs
      ...reactHooks.configs.recommended.rules,

      // Warn if components are not exported properly for fast refresh
      'react-refresh/only-export-components': [
        'warn',
        // Allow exporting constants that are components
        { allowConstantExport: true } 
      ],
    },
  },
);
