import js from '@eslint/js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'eslint:recommended', 'prettier'),
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'public/',
      '.vercel/',
      'coverage/',
      '**/*.d.ts',
      'src/lib/db/database.types.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Add custom rules here
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-undef': 'off',
    },
  },
];

export default eslintConfig;
