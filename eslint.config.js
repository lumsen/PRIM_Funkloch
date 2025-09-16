const globals = require('globals');
const eslint = require('@eslint/js');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        d3: true,
      },
    },
    rules: {
      // Enforce consistent indentation (2 spaces)
      'indent': ['error', 2],
      // Enforce Unix-style line endings
      'linebreak-style': ['error', 'unix'],
      // Enforce the use of single quotes for strings
      'quotes': ['error', 'single'],
      // Require semicolons at the end of statements
      'semi': ['error', 'always'],
      // Disallow unused variables
      'no-unused-vars': ['warn', { 'args': 'none' }],
      // Disallow the use of console.log, console.warn, and console.error
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
  eslint.configs.recommended,
];
