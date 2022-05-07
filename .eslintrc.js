/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'esnext'],
  env: {
    es6: true,
    browser: true,
    node: true
  },
  rules: {
    'no-unused-vars': 'warn',
    'import/no-nodejs-modules': 'off',
    'no-alert': 'off'
  }
};
