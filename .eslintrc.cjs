module.exports = {
    parser: '@typescript-eslint/parser', // Use TypeScript parser
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'next/core-web-vitals',
    ],
    rules: {
      // Custom ESLint rules
    },
  };