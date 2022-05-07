/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["esnext"],
  env: {
    es6: true,
    browser: true,
  },
  rules: {
    "no-unused-vars": "warn",
  },
};
