import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'

import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    plugins: {
      prettier,
    },

    rules: {
      // prettier 적용
      'prettier/prettier': 'warn',

      // react
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/prop-types': 'off', // TS 사용

      // TS
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',

      // fast refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
])