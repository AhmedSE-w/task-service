const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {ignores: ['coverage/']},
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs',
      globals: {...globals.node, ...globals.jest},
    },
    rules: {
      'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    },
  },
];
