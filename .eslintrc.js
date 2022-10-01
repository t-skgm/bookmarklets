/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended'],
  env: {
    es2022: true,
    browser: true,
    node: true,
    jest: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'import/no-nodejs-modules': 'off',
    'no-alert': 'off'
  }
};
