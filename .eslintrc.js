/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'esnext'],
  env: {
    es6: true,
    browser: true
  },
  rules: {
    'no-unused-vars': 'warn'
  }
};
