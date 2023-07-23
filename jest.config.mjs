/** @type {import('jest').Config} */
export default {
  setupFilesAfterEnv: ['<rootDir>/test/setup-jest.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)']
};
